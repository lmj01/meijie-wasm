cmake_minimum_required(VERSION 3.28)
project(app1)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app1 main.cpp)
target_link_libraries(app1 PUBLIC EnTT::EnTT)
