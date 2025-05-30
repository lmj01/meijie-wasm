cmake_minimum_required(VERSION 3.28)
include(FetchContent)

project(MJLang)

set(CMAKE_CXX_STANDARD 20)

#
# Projects
#

add_subdirectory(appC)
add_subdirectory(appCpp)
