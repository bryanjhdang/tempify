import { Button, Group, Stack, Table, Text, Title } from "@mantine/core";
import { FunctionalHeader, SimpleHeader, TextHeader } from "../../components/Headers";
import { Project } from "../../classes/models";
import { useEffect, useState } from "react";
import { deleteProject, getProjects, postProject } from "../../classes/HTTPhelpers";
import { IconCoin, IconPlus } from "@tabler/icons-react";
import classes from "./ProjectsPage.module.css";
import { useDisclosure } from "@mantine/hooks";
import NewProjectModal from "../../components/NewProjectModal";
import { handleLegacySelectEvents } from "echarts/types/src/legacy/dataSelectAction.js";
// import { IconCoin, IconPlus } from "@tabler/icons-react";
// import classes from "./ProjectsPage.module.css";
import { useAuth0 } from "@auth0/auth0-react";

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [opened, { open, close }] = useDisclosure();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const makeAuthenticatedRequest = async () => {
      try {
        const token = await getAccessTokenSilently();

        getProjects(token).then(
          (response) => {
            const sortedProjects = response.sort((a,b) => b.dateCreated - a.dateCreated);
            setProjects(sortedProjects);
          }
        );

      } catch (error) {
        console.error(error);
      }
    }

    makeAuthenticatedRequest();
  }, [getAccessTokenSilently]);

  // todo: prefer this syntax to try...catch?
  const handleDeleteProject = (id: string) => {
    getAccessTokenSilently().then((token) => {
      deleteProject(id, token).then(() => {
        const updatedProjects = projects.filter((project) => project.id !== id);
        setProjects(updatedProjects);
      })
    }).catch((error) => {
      console.error(error);
    }) 
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }

  const rows = projects.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td>{element.name}</Table.Td>
      <Table.Td>{element.hex}</Table.Td>
      <Table.Td>{formatDate(element.dateCreated)}</Table.Td>
      <Table.Td>
        <Button onClick={() => handleDeleteProject(element.id)}>Delete</Button>
      </Table.Td>
    </Table.Tr>
  ));

  const noProject = () => {
    return (
      <Stack align="center">
        <Text className={classes.noProjectHeader}>Looks like there's nothing here.</Text>
        <Text className={classes.noProjectText}>
          Click on the + New Project button to create a new project!
        </Text>
      </Stack>
    )
  }

  const handleAddProject = (project: Project) => {
    const makeAuthenticatedRequest = async () => {
      try {
        const token = await getAccessTokenSilently();
        
        setProjects([...projects, project]);
        postProject(project, token);

      } catch (error) {
        console.error(error);
      }
    }
    
    makeAuthenticatedRequest();
  };

  const addProjectButton = () => {
    return (
      <Button
        className={classes.addBtn}
        onClick={() => open()}
        leftSection={<IconPlus stroke={1.5} />}
      >
        New Project
      </Button>
    )
  }

  return (
    <>
      <NewProjectModal opened={opened} close={close} onAddProject={handleAddProject} />
      <FunctionalHeader text="Projects" element={addProjectButton()} />
      <Stack p={40}>
        {projects.length === 0 ? (
          noProject()
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className={classes.column}>Project</Table.Th>
                <Table.Th className={classes.column}>Color</Table.Th>
                <Table.Th className={classes.column}>Date Created</Table.Th>
                <Table.Th className={classes.column}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}

      </Stack>
    </>
  )
}

export default ProjectsPage;