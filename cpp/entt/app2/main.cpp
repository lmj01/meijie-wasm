#include <entt/entt.hpp>
#include <entt/meta/meta.hpp>
#include <iostream>

int main() {
  // Create an EnTT registry
  entt::registry registry{};

  // Create an entity and attach an int component
  auto E1 = registry.create();
  auto v1 = entt::entt_traits<entt::entity>::to_version(E1);
  auto e1 = entt::entt_traits<entt::entity>::to_entity(E1);
  registry.destroy(E1);
  auto E2 = entt::entt_traits<entt::entity>::construct(e1, v1 + 1);
  std::cout << int(E1) << std::endl;
  std::cout << int(E2) << std::endl;
  std::cout << "valid:" << registry.valid(E2) << std::endl;
  std::cout << "contains:" << registry.storage<entt::entity>().contains(E2)
            << std::endl;

  auto Ea1 = registry.create();
  registry.destroy(Ea1);
  for (auto ett : registry.storage<entt::entity>().each()) {
    std::cout << "entity a each" << std::endl;
  }
  for (auto ett : registry.storage<entt::entity>()) {
    std::cout << "entity a no each" << std::endl;
  }

  return 0;
}
