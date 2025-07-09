cmake_minimum_required(VERSION 3.28)
project(app2)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app2 main.cpp)
target_link_libraries(app2 PUBLIC EnTT::EnTT)

add_executable(d1 d1.cpp)
target_link_libraries(d1 PUBLIC EnTT::EnTT)

add_executable(d2 d2.cpp)
target_link_libraries(d2 PUBLIC EnTT::EnTT)

add_executable(org1 org1.cpp)
target_link_libraries(org1 PUBLIC EnTT::EnTT)

add_executable(org2 org2.cpp)
target_link_libraries(org2 PUBLIC EnTT::EnTT)
