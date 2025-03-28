cmake_minimum_required(VERSION 3.18)
project(MinimalEnTTTest)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(third/entt)
add_executable(MinimalEnTTTest main.cpp)
target_link_libraries(MinimalEnTTTest PUBLIC EnTT::EnTT)
