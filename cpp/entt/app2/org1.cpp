// https://github.com/skypjack/entt/discussions/1250#discussioncomment-13048145
#include <entt/entt.hpp>
#include <entt/meta/meta.hpp>
#include <iostream>

struct CompA {};
struct CompB {};
struct CompC {};

struct System0 {
  using View = entt::view<entt::get_t<const CompA>>;
  void tick(View view) {}
};

struct System1 {
  using View = entt::view<entt::get_t<const CompB>>;
  void tick(View view) {}
};

struct System2 {
  using View = entt::view<entt::get_t<const CompC>>;
  void tick(View view) {}
};

int main(int argc, char *argv[]) {
  System0 sys0;
  System1 sys1;
  System2 sys2;

  entt::organizer organizer;
  organizer.emplace<&System0::tick>(sys0, "sys0");
  organizer.emplace<&System1::tick>(sys1, "sys1");
  organizer.emplace<&System2::tick>(sys2, "sys2");

  auto graph = organizer.graph();
  for (auto &&node : graph) {
    // all nodes are top level and havent's in edges
    auto t1 = node.top_level();
    // std::cout << "Top-level entity" << static_cast<entt::entity>(t1)
    std::cout << "Top-level entity" << std::endl;
  }
  return 0;
}
