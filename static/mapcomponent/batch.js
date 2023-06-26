"use strict";

import {GLTFLoader} from "../deps/GLTFLoader.js";

let gltfLoader = new GLTFLoader();

/// Used to create and manage the visualization of one visual batch
export class MapViewerBatch
{
// public:

    constructor(batchName, coreLib, renderer, style, tileFeatureLayer, onLoadingFinishedFn, onLoadingErrorFn)
    {
        this.id = batchName;
        this.children = undefined;

        // Get the scene as GLB and visualize it.
        let sharedGlbArray = new coreLib.SharedUint8Array();
        renderer.render(style, tileFeatureLayer, sharedGlbArray);
        let objSize = sharedGlbArray.getSize();
        let bufferPtr = Number(sharedGlbArray.getPointer());
        let glbBuf = coreLib.HEAPU8.buffer.slice(bufferPtr, bufferPtr + objSize);

        gltfLoader.parse(
            glbBuf,
            "",
            // called once the gltf resource is loaded
            ( gltf ) =>
            {
                sharedGlbArray.delete()
                tileFeatureLayer.delete()

                this.children = gltf.scene.children;
                if(onLoadingFinishedFn)
                    onLoadingFinishedFn(this);
            },
            // called when loading has errors
            ( error ) => {
                // Don't spam errors when fetching fails because the server retracted a batch
                if(error.message && !error.message.endsWith("glTF versions >=2.0 are supported."))
                    console.warn( 'Glb load err: '+batchName+': '+error.message );
                if(onLoadingErrorFn)
                    onLoadingErrorFn()
            }
        )
    }

    dispose()
    {
        this.children.forEach( (root) =>
        {
            if (!root)
                return;

            root.traverse(
                (node) =>
                {
                    if (node.geometry)
                        node.geometry.dispose();

                    if (node.material)
                    {
                        if (node.material instanceof MeshFaceMaterial || node.material instanceof MultiMaterial) {
                            node.material.materials.forEach((mtrl) => {
                                if (mtrl.map) mtrl.map.dispose();
                                if (mtrl.lightMap) mtrl.lightMap.dispose();
                                if (mtrl.bumpMap) mtrl.bumpMap.dispose();
                                if (mtrl.normalMap) mtrl.normalMap.dispose();
                                if (mtrl.specularMap) mtrl.specularMap.dispose();
                                if (mtrl.envMap) mtrl.envMap.dispose();

                                mtrl.dispose();    // disposes any programs associated with the material
                            });
                        }
                        else {
                            if (node.material.map) node.material.map.dispose();
                            if (node.material.lightMap) node.material.lightMap.dispose();
                            if (node.material.bumpMap) node.material.bumpMap.dispose();
                            if (node.material.normalMap) node.material.normalMap.dispose();
                            if (node.material.specularMap) node.material.specularMap.dispose();
                            if (node.material.envMap) node.material.envMap.dispose();

                            node.material.dispose();   // disposes any programs associated with the material
                        }
                    }
                });
        });
    }
}
