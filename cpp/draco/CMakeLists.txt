cmake_minimum_required (VERSION 3.22)

project (mjdraco)
set (CMAKE_CXX_STANDARD 17)

add_subdirectory(draco)    

if (${EMSCRIPTEN})
    install(TARGETS ${PROJECT_NAME} DESTINATION ${CMAKE_INSTALL_PREFIX})
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.wasm DESTINATION ${CMAKE_INSTALL_PREFIX})
    install(FILES ${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.d.ts DESTINATION ${CMAKE_INSTALL_PREFIX})
elseif()
    
endif ()


