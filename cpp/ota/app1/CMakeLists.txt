# CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(oatpp_example)

set(CMAKE_CXX_STANDARD 17)

# 查找oatpp包
find_package(oatpp 1.4.0 REQUIRED)
find_package(oatpp-swagger 1.4.0 REQUIRED)

# 添加可执行文件
add_executable(${PROJECT_NAME}
    src/App.cpp
)

# 链接oatpp库
target_link_libraries(${PROJECT_NAME}
    PUBLIC
    oatpp::oatpp
    oatpp::oatpp-test
    oatpp::oatpp-swagger
)

# 设置编译选项
set_target_properties(${PROJECT_NAME} PROPERTIES
    CXX_STANDARD 17
    CXX_EXTENSIONS OFF
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

