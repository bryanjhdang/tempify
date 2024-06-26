import { Button, Menu, Text } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconFolderOpen, IconPlus, IconPointFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Project } from "../../classes/models";
import { getProjects, postProject } from "../../classes/HTTPhelpers";
// import classes from "./ProjectButton.module.css";
import NewProjectModal from "../../components/NewProjectModal";
import { useAuth0 } from "@auth0/auth0-react";
// import classes from "./ProjectButton.module.css";

interface ProjectButtonProps {
  selectedProject: Project | null;
  setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
}

export function ProjectButton({ selectedProject, setSelectedProject }: ProjectButtonProps) {
  const [opened, { open, close }] = useDisclosure();
  const [projects, setProjects] = useState<Project[]>([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const makeAuthenticatedRequest = async () => {
      try {
        const token = await getAccessTokenSilently();

        getProjects(token).then(
          (response) => {
            setProjects(response);
          }
        );

      } catch (error) {
        console.error(error);
      }
    }

    makeAuthenticatedRequest();
  }, [getAccessTokenSilently]);

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

  return (
    <>
      <NewProjectModal opened={opened} close={close} onAddProject={handleAddProject} />
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button
            variant="light"
            radius={"lg"}
            color={selectedProject ? selectedProject.hex : "black"}
            leftSection={<IconFolderOpen />}
          >
            {selectedProject ? selectedProject.name : "No Project"}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={() => setSelectedProject(null)}
            leftSection={<IconPointFilled style={{ width: (14), height: (14) }} />}
          >
            <Text fz={"sm"}>No Project</Text>
          </Menu.Item>

          <Menu.Divider />
          {projects.length > 0 && (
            <>
              <Menu.Label>Projects</Menu.Label>
              {projects
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(project => (
                  <Menu.Item
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    leftSection={<IconPointFilled style={{ width: (14), height: (14), color: project.hex }} />}
                  >
                    <Text fz={"sm"} c={project.hex}>{project.name}</Text>
                  </Menu.Item>
                ))}
                <Menu.Divider />
            </>
          )}

          <Menu.Item
            onClick={() => open()}
            leftSection={<IconPlus style={{ width: (14), height: (14) }} />}
          >
            Create a new project
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
