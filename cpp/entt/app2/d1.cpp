// https://github.com/skypjack/entt/discussions/1250#discussioncomment-13048145
#include <entt/entt.hpp>
#include <entt/meta/meta.hpp>
#include <iostream>

struct Comp {
  int x = 1;
};

struct CompInPlaceDelete {
  constexpr static bool in_place_delete = 1;
  int x = 1;
};

int main() {

  entt::registry reg{};
  auto ett = reg.create();
  reg.emplace<Comp>(ett);
  reg.emplace<CompInPlaceDelete>(ett);
  reg.destroy(ett);

  auto testfunc = [](auto &storage) {
    using storage_type = std::remove_cvref_t<decltype(storage)>;
    using storage_element_type = storage_type::element_type;
    const char *deletion_policy =
        storage.policy() == entt::deletion_policy::in_place
            ? "in_place"
            : (storage.policy() == entt::deletion_policy::swap_and_pop
                   ? "swap_and_pop"
                   : "swap_only");
    std::cout << "Testing storage for "
              << entt::type_name<storage_element_type>::value() << std::endl;
    std::cout << "deletion policy is " << deletion_policy << std::endl;

    for (auto ett : storage.each()) {
      std::cout << "storage.each() visits destoryed entity" << std::endl;
    }
    for (auto ett : storage) {
      std::cout << "storage.begin()/end() visits destroyed entity" << std::endl;
    }
    {
      entt::basic_view temp_view{storage};
      for (auto ett : temp_view.each()) {
        std::cout << "\t view.each visits destroyed entity" << std::endl;
      }
      for (auto ett : temp_view) {
        std::cout << "\t view visits destroyed entity" << std::endl;
      }
    }
    {
      entt::runtime_view runtime_v{};
      runtime_v.iterate(storage);
      for (auto ett : runtime_v) {
        std::cout << "\t runtime_view visits destroyed entity" << std::endl;
      }
      runtime_v.each([](auto ett) {
        std::cout << "\t runtime_view.each visits destroyed entity"
                  << std::endl;
      });
    }
    std::cout << "storage size=" << storage.size() << std::endl;
    std::cout << std::endl;
  };

  std::cout << std::endl << "test different entity object " << std::endl;
  testfunc(reg.storage<entt::entity>());
  testfunc(reg.storage<Comp>());
  testfunc(reg.storage<CompInPlaceDelete>());
  return 0;
}
