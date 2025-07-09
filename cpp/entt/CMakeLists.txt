cmake_minimum_required(VERSION 3.28)
project(MjEntt)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(entt)
add_subdirectory(app1)
add_subdirectory(app2)

# 配置安装规则
install(TARGETS app1 DESTINATION bin)

# 配置cpack选项
set(CPACK_PACKAGE_NAME "mjEntt")
set(CPACK_PACKAGE_VERSION "0.0.1")
set(CPACK_PACKAGE_DESCRIPTION "MY ENTT DEMO")
set(CPACK_PACKAGE_VENDOR "MeiJie Personal")
set(CPACK_PACKAGE_CONTACT "lmjie_good@163.com")

set(CPACK_GENERATOR "DEB;RPM;ZIP;TGZ")
# 设置特定配置
set(CPACK_DEBIAN_PACKAGE_DEPEND "libc6 (>= 2.3.1-6), libstdc++6")

set(CPACK_RPM_PACKAGE_RELEASE "1")
set(CPACK_RPM_PACKAGE_LICENSE "MIT")

set(CPACK_COMPONENTS_ALL applications libraries headers)

include(CPack)

