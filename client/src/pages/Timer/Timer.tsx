import { useState } from "react";
import { Text, Flex } from "@mantine/core";
import { NavbarSimple } from "../../components/Navbar/NavbarSimple";

function TimerPage() {
  const [active, setActive] = useState('Timer');

  return (
    <Flex>
      <NavbarSimple active={active} setActive={setActive} />
      <Flex>
        <Text>TIMER CONTENT SHOULD GO IN HERE</Text>
      </Flex>
    </Flex>
  );
}

export default TimerPage;