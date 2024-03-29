import { useState } from "react";
import { Text, Flex } from "@mantine/core";
import { NavbarSimple } from "../../components/Navbar/NavbarSimple";

function FriendsPage() {
  const [active, setActive] = useState('Friends');

  return (
    <Flex>
      <NavbarSimple active={active} setActive={setActive} />
      <Flex>
        <Text>The pet stuff is under construction. Come back after the checkpoint.</Text>
      </Flex>
    </Flex>
  )
}

export default FriendsPage