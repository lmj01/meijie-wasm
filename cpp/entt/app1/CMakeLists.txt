cmake_minimum_required(VERSION 3.28)
project(MinimalEnTTTest)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(MinimalEnTTTest main.cpp)
target_link_libraries(MinimalEnTTTest PUBLIC EnTT::EnTT)
