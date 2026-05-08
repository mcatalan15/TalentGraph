all: up

up:
	- HOST_PORT=80 HOST_PORT_SSL=443 docker compose -f ./containers/docker-compose.yaml up -d
	@printf "\n"
	@printf "\033[1;32m"
	@printf "##########################################################\n"
	@printf "##  You can access the application at:			##\n"
	@printf "##  https://talentgraph.localhost			##\n"
	@printf "##########################################################\n"
	@printf "\033[0m"

school:
	- HOST_PORT=8080 HOST_PORT_SSL=8443 docker compose -f ./containers/docker-compose.yaml up -d
	@printf "\n"
	@printf "\033[1;32m"
	@printf "##########################################################\n"
	@printf "##  You can access the application at:			##\n"
	@printf "##  https://talentgraph.localhost:8443			##\n"
	@printf "##########################################################\n"
	@printf "\033[0m"

down:
	-docker compose -f ./containers/docker-compose.yaml down

clean:
	-docker compose -f ./containers/docker-compose.yaml down --rmi all --volumes --remove-orphans

re: down up