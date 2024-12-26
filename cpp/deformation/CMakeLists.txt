cmake_minimum_required (VERSION 3.22)

project (draco-wasm)
set (CMAKE_CXX_STANDARD 17)
# 设置 C 和 C++ 编译器为 emcc 和 em++
set(CMAKE_C_COMPILER emcc)
set(CMAKE_CXX_COMPILER em++)
# set (TARGET draco-wasm)
set (CMAKE_CONFIGURATION_TYPES Debug;Release)

# 设置 Emscripten 的编译标志
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -s WASM=1 -O3 --bind")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s WASM=1 -O3 --bind")

get_filename_component(SOURCE_ROOT_DIR ${CMAKE_SOURCE_DIR} DIRECTORY)

set(eigen_path "${SOURCE_ROOT_DIR}/third_party/eigen")
set(eigen_include_path "${eigen_path}/Eigen")

message(WARNING "${SOURCE_ROOT_DIR}")

# 添加源文件（替换为你的实际文件）
set(SOURCE_FILES
    laplacian_deformation.hpp
    laplacian_deformation.cpp
)

add_subdirectory(${eigen_include_path})

if (${EMSCRIPTEN})
    
    add_executable(${PROJECT_NAME} ${SOURCE_FILES})
    # 设置输出文件后缀
    set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".js")

    # 添加头文件查找路径
    target_include_directories(${PROJECT_NAME} PRIVATE "${eigen_include_path}")
    # 设置 Emscripten 相关的链接选项（如果需要）
    target_link_libraries(${PROJECT_NAME} PRIVATE eigen)

    # add_compile_options(-DDRACO_JS_GLUE=ON)
    # install(TARGETS ${PROJECT_NAME} DESTINATION ${CMAKE_INSTALL_PREFIX})
    # install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.wasm DESTINATION ${CMAKE_INSTALL_PREFIX})
    # install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.d.ts DESTINATION ${CMAKE_INSTALL_PREFIX})
endif ()