cmake_minimum_required(VERSION 3.30.0)

project(dracoParser VERSION 1.0)
set (CMAKE_CXX_STANDARD 17)
set (TARGET draco-parser)
# set(CMAKE_CXX_FLAGS_DEBUG "$ENV{CXXFLAGS} -O0 -Wall -g2 -ggdb")
# set(CMAKE_CXX_FLAGS_RELEASE "$ENV{CXXFLAGS} -O3 -Wall")
set(CMAKE_BUILD_TYPE "Debug")
SET(CMAKE_CXX_STANDARD_REQUIRED TRUE)

# Draco
if(WIN32)
    set(DRACO_ROOT "D:/googleDraco/dracoInstall/ReleaseDLL")
    set(DRACO_ROOT_DEBUG "D:/googleDraco/dracoInstall/DebugDLL")
	
    set(DRACO_LIBRARIES 
        "${DRACO_ROOT}/lib/draco.lib"
    CACHE INTERNAL "")
    set(DRACO_LIBRARIES_DEBUG
        "${DRACO_ROOT_DEBUG}/lib/draco.lib"
    CACHE INTERNAL "")
	
	set(DRACO_RUNTIME_LIBRARIES
        "${DRACO_ROOT}/lib/draco.dll"
    CACHE INTERNAL "")
    set(DRACO_RUNTIME_LIBRARIES_DEBUG
        "${DRACO_ROOT_DEBUG}/lib/draco.dll"
    CACHE INTERNAL "")
	
	set(DRACO_INCLUDE_PATH "${DRACO_ROOT}/include" CACHE INTERNAL "")
    
elseif(UNIX)
    
endif()
set(EIGEN_INCLUDE_PATH "D:/googleDraco/draco/third_party/eigen" CACHE INTERNAL "") 
set(TINYGLTF_INCLUDE_PATH "D:/googleDraco/draco/third_party/tinygltf" CACHE INTERNAL "")

add_executable(${PROJECT_NAME} testDraco.cpp)
target_include_directories(${PROJECT_NAME}  
PRIVATE 
    ${EIGEN_INCLUDE_PATH}
    ${TINYGLTF_INCLUDE_PATH}
    ${DRACO_INCLUDE_PATH}
)
target_link_libraries(${PROJECT_NAME} 
PUBLIC
	debug ${DRACO_LIBRARIES_DEBUG}
	optimized ${DRACO_LIBRARIES}
)   


if(WIN32)

set(DLL_FILES
    ${DRACO_RUNTIME_LIBRARIES}
)

set(DLL_FILES_DEBUG 
    ${DRACO_RUNTIME_LIBRARIES_DEBUG}
)

add_custom_command(
TARGET ${PROJECT_NAME}
COMMAND ${CMAKE_COMMAND} -E copy_if_different "$<IF:$<CONFIG:Debug>,${DLL_FILES_DEBUG},${DLL_FILES}>" $<TARGET_FILE_DIR:${PROJECT_NAME}>
COMMAND_EXPAND_LISTS
)
endif()

