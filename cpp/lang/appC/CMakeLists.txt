
# App

project(AppCpp C)

# 设置 C 标准（例如 C11）
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)


set(SOURCES
    main.c
)

set(SRCAPP2 quad.c)
# Add the executable target
add_executable(cApp1 ${SOURCES})
add_executable(cApp2 ${SRCAPP2})
