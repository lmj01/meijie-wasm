#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//-----core define begin----
typedef struct {
  char *name;
  void *(*create_conf)(void);
  int (*init_module)(void *conf);
  int (*handler)(void *conf);
} ngx_module_t;

typedef struct {
  char *name;
  int (*set)(void *conf, char *value);
} ngx_command_t;

//-----core define end----

// ----module A begin
typedef struct {
  int max_conns;
} ModuleAConf;

int set_max_conns(void *conf, char *value) {
  ModuleAConf *ac = (ModuleAConf *)conf;
  ac->max_conns = atoi(value);
  return 0;
}

ngx_command_t moduleA_commands[] = {{"max_conns", set_max_conns}, {NULL, NULL}};

int moduleA_handler(void *conf) {
  ModuleAConf *ac = (ModuleAConf *)conf;
  printf("ModuleA: Handling request, max_conns=%d\n", ac->max_conns);
  return 0;
}

void *create_ModuleA_Conf() { return calloc(1, sizeof(ModuleAConf)); }

ngx_module_t moduleA = {"moduleA", create_ModuleA_Conf, NULL, moduleA_handler};

// ----module A end

// ----module B begin
typedef struct {
  char *log_level;
} ModuleBConf;

int set_log_level(void *conf, char *value) {
  ModuleBConf *bc = (ModuleBConf *)conf;
  bc->log_level = strdup(value);
  return 0;
}

ngx_command_t moduleB_commands[] = {{"log_level", set_log_level}, {NULL, NULL}};

int moduleB_handler(void *conf) {
  ModuleBConf *bc = (ModuleBConf *)conf;
  printf("ModuleB: logging request, level=%s\n", bc->log_level);
  return 0;
}

void *create_ModuleB_Conf() { return calloc(1, sizeof(ModuleBConf)); }

ngx_module_t moduleB = {"moduleB", create_ModuleB_Conf, NULL, moduleB_handler};

// ----module B end
int main() {
  ModuleAConf *confA = moduleA.create_conf();
  ModuleBConf *confB = moduleB.create_conf();

  for (ngx_command_t *cmd = moduleA_commands; cmd->name; cmd++) {
    if (strcmp(cmd->name, "max_conns") == 0) {
      cmd->set(confA, "100");
    }
  }
  for (ngx_command_t *cmd = moduleB_commands; cmd->name; cmd++) {
    if (strcmp(cmd->name, "log_level") == 0) {
      cmd->set(confB, "debug");
    }
  }

  moduleA.handler(confA);
  moduleB.handler(confB);

  free(confA);
  free(confB);
  return 0;
}
