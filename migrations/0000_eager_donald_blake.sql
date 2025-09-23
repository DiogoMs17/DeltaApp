CREATE TABLE "administrators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"access_code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_type" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "administrators_access_code_unique" UNIQUE("access_code")
);
--> statement-breakpoint
CREATE TABLE "composicao_detalhada" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"value_per_kg" numeric(10, 2) NOT NULL,
	"value_per_unit" numeric(10, 2) NOT NULL,
	"value_per_box" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "composicao_preco" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"input_cost_per_kg" numeric(10, 2) NOT NULL,
	"input_cost_per_unit" numeric(10, 2) NOT NULL,
	"input_cost_per_box" numeric(10, 2) NOT NULL,
	"operational_cost_per_kg" numeric(10, 2) NOT NULL,
	"operational_cost_per_unit" numeric(10, 2) NOT NULL,
	"operational_cost_per_box" numeric(10, 2) NOT NULL,
	"commercial_expenses_per_kg" numeric(10, 2) NOT NULL,
	"commercial_expenses_per_unit" numeric(10, 2) NOT NULL,
	"commercial_expenses_per_box" numeric(10, 2) NOT NULL,
	"taxes_per_kg" numeric(10, 2) NOT NULL,
	"taxes_per_unit" numeric(10, 2) NOT NULL,
	"taxes_per_box" numeric(10, 2) NOT NULL,
	"margin_percentage" numeric(5, 2) NOT NULL,
	"margin_per_kg" numeric(10, 2) NOT NULL,
	"margin_per_unit" numeric(10, 2) NOT NULL,
	"margin_per_box" numeric(10, 2) NOT NULL,
	"final_price_per_kg" numeric(10, 2) NOT NULL,
	"final_price_per_unit" numeric(10, 2) NOT NULL,
	"final_price_per_box" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insumos" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"purchase_value" numeric(10, 2) NOT NULL,
	"yield_percentage" numeric(5, 2) NOT NULL,
	"final_cost_per_kg" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "insumos_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "log_alteracoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"insumo_id" integer,
	"change_type" text NOT NULL,
	"previous_value" text,
	"new_value" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "logistica_transporte" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"fiorino" numeric(10, 2) NOT NULL,
	"truck" numeric(10, 2) NOT NULL,
	"carreta" numeric(10, 2) NOT NULL,
	"observations" text
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_configuration" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"acordos_contratuais" numeric(5, 3) DEFAULT '14.250' NOT NULL,
	"contratuais_percent" numeric(5, 3) DEFAULT '14.250' NOT NULL,
	"trade_marketing_percent" numeric(5, 3) DEFAULT '0.000' NOT NULL,
	"comissoes_percent" numeric(5, 3) DEFAULT '0.000' NOT NULL,
	"despesas_gerais_adm" numeric(5, 3) DEFAULT '10.500' NOT NULL,
	"prazo_pagamento_dias" integer DEFAULT 30 NOT NULL,
	"juros_am" numeric(5, 2) DEFAULT '1.00' NOT NULL,
	"encargos_percent" numeric(5, 2) DEFAULT '2.00' NOT NULL,
	"armazenagem_percent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"margem_percent" numeric(5, 3) DEFAULT '10.000' NOT NULL,
	"icms_percent" numeric(5, 3) DEFAULT '7.000' NOT NULL,
	"pis_percent" numeric(5, 3) DEFAULT '0.000' NOT NULL,
	"cofins_percent" numeric(5, 3) DEFAULT '0.000' NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "product_insumos" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"insumo_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"kg_per_unit" numeric(10, 3) NOT NULL,
	"yield_percentage" numeric(5, 2) NOT NULL,
	"purchase_value" numeric(10, 2) NOT NULL,
	"cost_per_kg" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "status_aprovacao_margem" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"status" text NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp,
	"rejected_by" integer,
	"rejected_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	"can_approve" boolean DEFAULT false NOT NULL,
	"can_view_sensitive" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
