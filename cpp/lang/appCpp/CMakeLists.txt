
# App

project(AppCpp LANGUAGES CXX)

# 设置 C++ 标准 (推荐至少 C++17)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)   # 必须支持指定标准
set(CMAKE_CXX_EXTENSIONS OFF)         # 禁用编译器扩展（如 GNU 的 -std=gnu++17）

set(SOURCES
    main.cpp
)

# Add the executable target
add_executable(cppApp1 ${SOURCES})
