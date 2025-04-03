cmake_minimum_required(VERSION 3.28)
project(MjBgfx)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# set policy
if (POLICY CMP0168)
    cmake_policy(SET CMP0168 NEW)
endif()
if (POLICY CMP0169)
    cmake_policy(SET CMP0169 NEW)
endif()

# Bgfx configuration
include(FetchContent)
FetchContent_Declare(
    bgfx
    GIT_REPOSITORY https://github.com/bkaradzic/bgfx.cmake.git
    GIT_TAG v1.129.8866-492
    SOURCE_DIR ${CMAKE_SOURCE_DIR}/_deps/bgfx-src
    BINARY_DIR ${CMAKE_SOURCE_DIR}/_deps/bgfx-build
)
FetchContent_GetProperties(bgfx) 
if (NOT bgfx_POPULATED)
    FetchContent_MakeAvailable(bgfx)
endif()

add_subdirectory(app)
