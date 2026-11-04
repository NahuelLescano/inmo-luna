.PHONY: all front back

all: front back

front:
	@cd inmo-luna-front && pnpm dev

back:
	@cd inmo-luna-back && pnpm dev
