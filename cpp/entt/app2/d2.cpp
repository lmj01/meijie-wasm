
#include <chrono>
#include <cstdint>
#include <entt/entt.hpp>
#include <entt/meta/meta.hpp>
#include <iostream>
#include <thread>

// 定义组件

struct Position {
  float x, y;
};

struct Velocity {
  float dx, dy;
};

struct Health {
  int value;
};

// 定义事件
struct CollisionEvent {
  entt::entity a;
  entt::entity b;
};

void movementSystem(entt::registry &reg, float delta) {
  auto view = reg.view<Position, Velocity>();
  for (auto entity : view) {
    auto &pos = view.get<Position>(entity);
    const auto &vel = view.get<Velocity>(entity);
    pos.x += vel.dx * delta;
    pos.y += vel.dy * delta;
    std::cout << "Entity" << static_cast<uint32_t>(entity)
              << " moved to position (" << pos.x << ", " << pos.y << ")"
              << std::endl;
  }
}

void collisionSystem(entt::registry &reg, entt::dispatcher &dispatcher) {
  auto view = reg.view<Position>();
  for (auto a : view) {
    const auto &posA = view.get<Position>(a);
    for (auto b : view) {
      if (a == b)
        continue;
      const auto &posB = view.get<Position>(b);
      float distance = std::sqrt(std::pow(posA.x - posB.x, 2) +
                                 std::pow(posA.y - posB.y, 2));
      if (distance < 10.0f) {
        // dispatcher.trigger<CollisionEvent>(a, b);
        CollisionEvent event{a, b};
        dispatcher.trigger(event);
      }
    }
  }
}

void onCollision(const CollisionEvent &event, entt::registry &reg) {
  std::cout << "Collision detected between entitties "
            << static_cast<uint32_t>(event.a) << " and "
            << static_cast<uint32_t>(event.b) << std::endl;

  if (reg.all_of<Health>(event.a)) {
    auto &health = reg.get<Health>(event.a);
    health.value -= 10;
    std::cout << "Entity " << static_cast<uint32_t>(event.a)
              << " health reduced to " << health.value << std::endl;
  }

  if (reg.all_of<Health>(event.b)) {
    auto &health = reg.get<Health>(event.b);
    health.value -= 10;
    std::cout << "Entity " << static_cast<uint32_t>(event.b)
              << " health reduced to " << health.value << std::endl;
  }
}

int main() {

  entt::registry reg{};
  entt::dispatcher dispatcher;

  dispatcher.sink<CollisionEvent>().connect<&onCollision>(reg);

  auto entity1 = reg.create();
  reg.emplace<Position>(entity1, 0.0f, 0.0f);
  reg.emplace<Velocity>(entity1, 1.0f, 1.0f);
  reg.emplace<Health>(entity1, 100);

  auto entity2 = reg.create();
  reg.emplace<Position>(entity2, 5.0f, 5.0f);
  reg.emplace<Velocity>(entity2, -1.0f, -1.0f);
  reg.emplace<Health>(entity2, 100);

  auto entity3 = reg.create();
  reg.emplace<Position>(entity3, 5.0f, 5.0f);
  reg.emplace<Velocity>(entity3, -1.0f, -1.0f);

  const int totalFrame = 50;
  bool running = true;
  int frameCount = 0;
  while (running && frameCount < totalFrame) {
    auto deltaTime = 0.1f; // 100ms

    movementSystem(reg, deltaTime);
    collisionSystem(reg, dispatcher);

    dispatcher.update();

    if (frameCount >= totalFrame) {
      running = false;
    }

    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    frameCount++;
  }

  return 0;
}
