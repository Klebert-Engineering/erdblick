#pragma once

#include <vector>
#include <stdint.h>
#include <memory>
#include <string>

namespace erdblick
{

class SharedUint8Array
{
public:
    SharedUint8Array() = default;
    explicit SharedUint8Array(uint32_t size);
    explicit SharedUint8Array(std::string const& data);
    [[nodiscard]] uint32_t getSize() const;
    __UINT64_TYPE__ getPointer();
    std::shared_ptr<std::vector<uint8_t>> getArray();

    void writeToArray(const char* start, const char* end);
    void writeToArray(std::string& content);

    std::string toString() const;

private:
    std::vector<uint8_t> array_;
};

}