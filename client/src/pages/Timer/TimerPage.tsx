import { useState, useEffect } from "react";
import { Flex, Image } from "@mantine/core";
import { TaskInput } from "./TaskInputBar/TaskInput";
import { Pet, Project, TimerStatus } from "../../classes/models";
import TodoList from "./Todo/TodoList";
import SocketConnection from "./SocketConnection/SocketConnection";
import { Timer } from "./TaskInputBar/Timer";
import { TimerContext } from "../../context/TimerContext";
import { useAuth0 } from "@auth0/auth0-react";
import { getAccount, getProjects } from "../../classes/HTTPhelpers";
import { getPathById } from "../../classes/shopItems";
import classes from "./TimerPage.module.css";
import { PageLoader } from "../../components/PageLoader";

function TimerPage() {
  const [task, setTask] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useAuth0();
  let timerStatus = new TimerStatus(false, 0);

  const [pet, setPet] = useState<Pet>();
  const [startTime, setStartTime] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const makeAuthenticatedRequest = async () => {
      try {
        const token = await getAccessTokenSilently();
        const userId = user?.sub || "not logged in";

        const [projectsResponse, accountResponse] = await Promise.all([
          getProjects(token),
          getAccount(userId, token)
        ]);

        setPet(accountResponse.pet);
        setStartTime(accountResponse.runningTime.startTime);
        setTask(accountResponse.runningTime.name);

        const currentProjectId = accountResponse.runningTime.projectId;
        const foundProject = projectsResponse.find(project => project.id === currentProjectId);
        setSelectedProject(foundProject ?? null);

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    makeAuthenticatedRequest();
  }, [getAccessTokenSilently, user?.sub]);

  if (loading) return <PageLoader />

  return (
    <TimerContext.Provider value={timerStatus}>
      <Flex direction={"row"} py={20} px={40} gap={20}>
        <Flex direction={"column"} flex={1}>
          <TaskInput
            task={task}
            setTask={setTask}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />

          <div className={classes.img}>
            {pet && (
              startTime === undefined ? (
                <Image className={classes.restAnim} w={400} h={400} src={getPathById(true, pet.restId)} />
              ) : (
                <Image className={classes.workAnim} w={400} h={400} src={getPathById(false, pet.workId)} />
              )
            )}
          </div>

        </Flex>
        <Flex direction={"column"} gap={20}>
          <Timer task={task} selectedProject={selectedProject} setStart={setStartTime} />
          <TodoList setTask={setTask} />
          <SocketConnection />
        </Flex>
      </Flex>
    </TimerContext.Provider>
  );
}

export default TimerPage;
