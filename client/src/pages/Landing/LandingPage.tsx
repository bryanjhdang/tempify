import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Center, Box, Flex, Text, Title, Button } from "@mantine/core";
import { useEffect } from "react";

function LandingPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();   
  const navigate = useNavigate();
  
    // todo: some flicker in transition from Landing to Timer, may be inherent to current styling
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/timer');
        } 
    }, [isAuthenticated, navigate]);
    
    const handleLogin = async () => {
        await loginWithRedirect({
            appState: {
                returnTo: "/timer",
            },
            authorizationParams: {
                prompt: "login",
            },
        });
    };

    function signInButton() {
        return (
            <>
                <Button
                    onClick={handleLogin}
                    variant="gradient"
                    gradient={{
                        from: 'yellow',
                        to: 'orange',
                        deg: 90
                    }}
                >
                    SIGN IN
                </Button>
            </>
        );
    }

    // function templifyTitle() {
    //     return (
    //         <>
    //             <Center>
    //                 <Title
    //                     order={1}
    //                     size={100}
    //                 >
    //                     <Text
    //                         inherit
    //                         span
    //                         fw={900}
    //                         variant='gradient'
    //                         gradient={{
    //                             from: 'rgba(255, 157, 71, 1)',
    //                             to: 'rgba(252, 210, 96, 1)',
    //                             deg: 90
    //                         }}
    //                     >
    //                         TEMPLIFY
    //                     </Text>
    //                 </Title>
    //             </Center>
    //         </>
    //     );
    // }

  function tempifyTitle() {
    return (
      <>
        <Center>
          <Title order={1} size={100}>
            <Text
              inherit
              span
              fw={900}
              variant="gradient"
              gradient={{
                from: "rgba(255, 157, 71, 1)",
                to: "rgba(252, 210, 96, 1)",
                deg: 90,
              }}
            >
              TEMPIFY
            </Text>
          </Title>
        </Center>
      </>
    );
  }

  return (
    <>
      <Center style={{ height: "100vh" }}>
        <Box style={{ width: 200 }}>
          <Flex direction="column" gap="md">
            {tempifyTitle()}
            {signInButton()}
          </Flex>
        </Box>
      </Center>
    </>
  );
}

export default LandingPage;