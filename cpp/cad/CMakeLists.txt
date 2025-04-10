cmake_minimum_required(VERSION 3.28)
project(MjCadApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# set policy
if (POLICY CMP0168)
    cmake_policy(SET CMP0168 NEW)
endif()
if (POLICY CMP0169)
    cmake_policy(SET CMP0169 NEW)
endif()

# solvespace configuration
# include(FetchContent)
# FetchContent_Declare(
#     solvespace
#     GIT_REPOSITORY https://github.com/solvespace/solvespace.git
#     GIT_TAG v3.1
#     SOURCE_DIR ${CMAKE_SOURCE_DIR}/_deps/solvespace-src
#     BINARY_DIR ${CMAKE_SOURCE_DIR}/_deps/solvespace-build
# )
# FetchContent_GetProperties(solvespace) 
# if (NOT solvespace_POPULATED)
#     FetchContent_MakeAvailable(solvespace)
# endif()

# eigen configuration
include(FetchContent)
FetchContent_Declare(
    eigen
    GIT_REPOSITORY https://gitlab.com/libeigen/eigen.git
    GIT_TAG 3.4.0
    SOURCE_DIR ${CMAKE_SOURCE_DIR}/_deps/eigen-src
    BINARY_DIR ${CMAKE_SOURCE_DIR}/_deps/eigen-build
)
FetchContent_GetProperties(eigen) 
if (NOT eigen_POPULATED)
    FetchContent_MakeAvailable(eigen)
endif()
option(EIGEN_SPLIT_LARGE_TESTS "eigen test" OFF)

add_subdirectory(deformation)
#add_executable(MinimalEnTTTest main.cpp)
#target_link_libraries(MinimalEnTTTest PUBLIC EnTT::EnTT)
