cmake_minimum_required(VERSION 3.28)
include(FetchContent)

project(MJOgl)

set(CMAKE_CXX_STANDARD 20)

# set policy
if (POLICY CMP0168)
    cmake_policy(SET CMP0168 NEW)
endif()
if (POLICY CMP0169)
    cmake_policy(SET CMP0169 NEW)
endif()
#
# Dependencies
#

## https://gitlab.kitware.com/cmake/cmake/-/issues/19899
# GLFW
FetchContent_Declare(
    glfw3
    EXCLUDE_FROM_ALL
    GIT_REPOSITORY https://github.com/glfw/glfw.git
    GIT_TAG 3.4
    SOURCE_DIR ${CMAKE_SOURCE_DIR}/_deps/glfw3-src
    BINARY_DIR ${CMAKE_SOURCE_DIR}/_deps/glfw3-build
)
FetchContent_GetProperties(glfw3) 
message(STATUS "glfw3 ${glfw3_POPULATED}")
if (NOT glfw3_POPULATED)
    FetchContent_MakeAvailable(glfw3)
    #add_subdirectory(${glfw3_SOURCE_DIR} ${glfw3_BINARY_DIR})
endif()

# OpenGL
find_package(OpenGL REQUIRED)

# GLAD
FetchContent_Declare(
    glad
    EXCLUDE_FROM_ALL
    GIT_REPOSITORY https://github.com/Dav1dde/glad.git
    GIT_TAG v2.0.8
    SOURCE_DIR ${CMAKE_SOURCE_DIR}/_deps/glad-src
    BINARY_DIR ${CMAKE_SOURCE_DIR}/_deps/glad-build
)
FetchContent_GetProperties(glad)
if(NOT glad_POPULATED)
    FetchContent_MakeAvailable(glad)
    add_subdirectory("${glad_SOURCE_DIR}/cmake" glad_cmake)
    glad_add_library(glad REPRODUCIBLE EXCLUDE_FROM_ALL LOADER API gl:core=4.6)
endif()

# GLM
FetchContent_Declare(
    glm
    EXCLUDE_FROM_ALL
    GIT_REPOSITORY https://github.com/g-truc/glm.git
    GIT_TAG 1.0.1
    SOURCE_DIR ${CMAKE_SOURCE_DIR}/_deps/glm-src
    BINARY_DIR ${CMAKE_SOURCE_DIR}/_deps/glm-build
)
FetchContent_GetProperties(glm)
if (NOT glm_POPULATED)
    FetchContent_MakeAvailable(glm)
    #add_subdirectory(${glm_SOURCE_DIR} ${glm_BINARY_DIR})
endif()

#
# Projects
#

add_subdirectory(App)
