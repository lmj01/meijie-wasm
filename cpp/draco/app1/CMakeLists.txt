cmake_minimum_required(VERSION 3.30.0)
project (mjdraco)
set (CMAKE_CXX_STANDARD 17)
set (TARGET app1)
if (UNIX) 
    set(CMAKE_CXX_FLAGS_DEBUG "$ENV{CXXFLAGS} -O0 -Wall -g2 -ggdb")
    set(CMAKE_CXX_FLAGS_RELEASE "$ENV{CXXFLAGS} -O3 -Wall")
endif()
# set(CMAKE_BUILD_TYPE "Debug")
SET(CMAKE_CXX_STANDARD_REQUIRED TRUE)

if (WIN32)
set(CMAKE_PREFIX_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../install/windows/share/cmake;${CMAKE_PREFIX_PATH}")
set(DRACO_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../install/windows/include" CACHE INTERNAL "") 
elseif(UNIX)
set(CMAKE_PREFIX_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../install/linux/share/cmake;${CMAKE_PREFIX_PATH}")
set(DRACO_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../install/linux/include" CACHE INTERNAL "") 
endif()
set(EIGEN_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../draco/third_party/eigen" CACHE INTERNAL "") 
set(TINYGLTF_INCLUDE_PATH "${CMAKE_SOURCE_DIR}/../draco/third_party/tinygltf" CACHE INTERNAL "")

find_package(draco REQUIRED)

add_executable(app1 parser.cpp)
target_include_directories(app1 PRIVATE 
    ${DRACO_INCLUDE_PATH}
    ${EIGEN_INCLUDE_PATH}
    ${TINYGLTF_INCLUDE_PATH} 
)
target_link_libraries(app1 PUBLIC draco::draco)   

install(TARGETS app1
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    PUBLIC_HEADER DESTINATION include
)


# if(WIN32)

# add_custom_command(
#     TARGET ${PROJECT_NAME}
#     COMMAND ${CMAKE_COMMAND} -E copy_if_different "$<IF:$<CONFIG:Debug>,${DLL_FILES_DEBUG},${DLL_FILES}>" $<TARGET_FILE_DIR:${PROJECT_NAME}>
#     COMMAND_EXPAND_LISTS
# )
# endif()

