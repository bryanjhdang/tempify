import { DEFAULT_THEME, Modal, Button, Menu, TextInput, ColorPicker, Text, Stack } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconFolderOpen, IconPlus, IconPointFilled } from "@tabler/icons-react";
import { useState } from "react";
import { Project } from "../../../classes/models";

interface NewProjectModalProps {
  opened: boolean;
  close: () => void,
  onAddProject: (project: Project) => void;
}

function NewProjectModal({ opened, close, onAddProject }: NewProjectModalProps): JSX.Element {

  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState(DEFAULT_THEME.colors.red[4]);

  const handleCreateProject = () => {
    const newProject = new Project(Date.now().toString(), projectColor, projectName);
    onAddProject(newProject);
    close();
    setProjectName("");
    setProjectColor(DEFAULT_THEME.colors.red[4]);
  }

  return (
    <Modal opened={opened} onClose={close} title="Create new project" centered>
      <Stack>
        <TextInput
          withAsterisk
          placeholder={"Project name"}
          value={projectName}
          onChange={(event) => setProjectName(event.currentTarget.value)}
        />
        <ColorPicker
          format="hex"
          value={projectColor}
          onChange={(color) => setProjectColor(color)}
          withPicker={false}
          fullWidth
          swatches={
            Object.values(DEFAULT_THEME.colors).map(colorArray => colorArray[4])
          }
        />
        <Text>{projectColor}</Text>
        <Button w={"100%"} onClick={handleCreateProject}>Create project</Button>
      </Stack>
    </Modal>
  )
}

interface ProjectButtonProps {
  selectedProject: Project | null;
  setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
}

export function ProjectButton({ selectedProject, setSelectedProject }: ProjectButtonProps) {
  const [opened, { open, close }] = useDisclosure();

  // This should be retrieved from a GET request
  const [projects, setProjects] = useState<Project[]>([
    new Project("1", "#007bff", "CMPT 372"),
    new Project("2", "#dc3545", "CMPT 410"),
  ]);

  const handleAddProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  return (
    <>
      <NewProjectModal opened={opened} close={close} onAddProject={handleAddProject} />
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button
            variant="light"
            radius={"xl"}
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
          <Menu.Label>Projects</Menu.Label>
          {projects.map(project => (
            <Menu.Item
              key={project.id}
              onClick={() => setSelectedProject(project)}
              leftSection={<IconPointFilled style={{ width: (14), height: (14), color: project.hex }} />}
            >
              <Text fz={"sm"} c={project.hex}>{project.name}</Text>
            </Menu.Item>
          ))}

          <Menu.Divider />
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