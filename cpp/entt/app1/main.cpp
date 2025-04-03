#include <entt/entt.hpp>
#include <entt/meta/meta.hpp>
#include <iostream>

int main() {
    // Create an EnTT registry
    entt::registry registry;

    // Create an entity and attach an int component
    auto entity = registry.create();
    registry.emplace<int>(entity, 42);

    // Verify the component and print its value
    if (registry.all_of<int>(entity)) {
        int value = registry.get<int>(entity);
        std::cout << "Entity has int component with value: " << value << std::endl;
    } else {
        std::cerr << "Entity does not have int component." << std::endl;
    }
    
    return 0;
}
