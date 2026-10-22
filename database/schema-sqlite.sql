CREATE TABLE "categorias" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_categorias" PRIMARY KEY AUTOINCREMENT,
    "Nome" TEXT NOT NULL,
    "Slug" TEXT NOT NULL,
    "Icone" TEXT NOT NULL,
    "Cor" TEXT NOT NULL
);


CREATE TABLE "cursos" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_cursos" PRIMARY KEY AUTOINCREMENT,
    "NomeCompleto" TEXT NOT NULL,
    "NomeBreve" TEXT NOT NULL,
    "Slug" TEXT NOT NULL,
    "Resumo" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    "CategoriaId" INTEGER NOT NULL,
    "Modalidade" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "CargaHoraria" INTEGER NOT NULL,
    "PublicoAlvo" TEXT NOT NULL,
    "Certificacao" TEXT NOT NULL,
    "ImagemUrl" TEXT NOT NULL,
    "DataDisponibilizacao" TEXT NULL,
    "Destaque" INTEGER NOT NULL,
    "NomeBusca" TEXT NOT NULL,
    CONSTRAINT "FK_cursos_categorias_CategoriaId" FOREIGN KEY ("CategoriaId") REFERENCES "categorias" ("Id") ON DELETE RESTRICT
);


CREATE TABLE "modulos" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_modulos" PRIMARY KEY AUTOINCREMENT,
    "CursoId" INTEGER NOT NULL,
    "Ordem" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    CONSTRAINT "FK_modulos_cursos_CursoId" FOREIGN KEY ("CursoId") REFERENCES "cursos" ("Id") ON DELETE CASCADE
);


CREATE TABLE "aulas" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_aulas" PRIMARY KEY AUTOINCREMENT,
    "ModuloId" INTEGER NOT NULL,
    "Ordem" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT NOT NULL,
    "Tipo" TEXT NOT NULL,
    "DuracaoMinutos" INTEGER NOT NULL,
    CONSTRAINT "FK_aulas_modulos_ModuloId" FOREIGN KEY ("ModuloId") REFERENCES "modulos" ("Id") ON DELETE CASCADE
);


CREATE INDEX "IX_aulas_ModuloId" ON "aulas" ("ModuloId");


CREATE UNIQUE INDEX "IX_categorias_Slug" ON "categorias" ("Slug");


CREATE INDEX "IX_cursos_CategoriaId" ON "cursos" ("CategoriaId");


CREATE INDEX "IX_cursos_Modalidade" ON "cursos" ("Modalidade");


CREATE UNIQUE INDEX "IX_cursos_Slug" ON "cursos" ("Slug");


CREATE INDEX "IX_cursos_Status" ON "cursos" ("Status");


CREATE INDEX "IX_modulos_CursoId" ON "modulos" ("CursoId");


