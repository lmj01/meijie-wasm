cmake_minimum_required(VERSION 3.28)
project(app2)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app2 main.cpp)
target_link_libraries(app2 PUBLIC EnTT::EnTT)

add_executable(d1 d1.cpp)
target_link_libraries(d1 PUBLIC EnTT::EnTT)
