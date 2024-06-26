/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";

import {
  Title,
  Text,
  Slider,
  Center,
  Flex,
  Button,
  Space,
  Transition,
  // ActionIcon,
} from "@mantine/core";
// import { IconPlayerStop } from "@tabler/icons-react";

import {
  getAccount,
  postTimeEntryStart,
  postTimeEntryStop,
} from "../../../classes/HTTPhelpers";
import { Project, TimeEntry } from "../../../classes/models";

import { useTimerContext } from "../../../context/TimerContext";
import { useAuth0 } from "@auth0/auth0-react";

interface TimerProps {
  task: string;
  selectedProject: Project | null;
  setStart: (time: number | undefined) => void;
}

export function Timer({ task, selectedProject, setStart }: TimerProps): JSX.Element {
  const { user, getAccessTokenSilently } = useAuth0();

  /* ---------------------------------- State --------------------------------- */
  const [timerValue, setTimerValue] = useState<number>(0); // in seconds
  const [timerProgressTextValue, setTimerProgressTextValue] =
    useState<string>(`0:00`);
  // const [timerProgressWheelValue, setTimerProgressWheelValue] =
  //   useState<number>(0);
  // const [timerProgressWheelRounding, setTimerProgressWheelRounding] =
  //   useState<boolean>(false);

  const [mountTimerInput, setMountTimerInput] = useState<boolean>(true);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const timerContext = useTimerContext();

  /* ---------------------------- Helper Functions ---------------------------- */
  function convertSliderValueToSeconds(value: number): number {
    let seconds: number = 0;

    // the slider supports all 120 minutes, therefore just multiply by 60
    seconds = value * 60;

    return seconds;
  }
  function convertSecondsToProgressTextValue(seconds: number): string {
    // we take the floor of the seconds divided by 60 to get the minutes
    // we take the remainder of the seconds divided by 60 to get the remaining seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    // padStart is used to ensure that the string str is at least 2 characters long.
    // If str is less than 2 characters long, padStart will add "0"s to the start of str
    // until it is 2 characters long. this is for seconds < 10
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  // function convertSecondsToProgressWheelValue(seconds: number): number {
  //   let value: number = 0;

  //   /* 
  //       ring progress value to minutes mapping (as ring only goes up to 100)
  //       0 -> 0
  //       25 -> 30 minutes
  //       50 -> 60 minutes
  //       75 -> 90 minutes
  //       100 -> 120 minutes
  //       therefore slider value to seconds and milliseconds mapping is:
  //       0 -> 0
  //       25 -> 1800 seconds -> 1800000 milliseconds
  //       50 -> 3600 seconds -> 3600000 milliseconds
  //       75 -> 5400 seconds -> 5400000 milliseconds
  //       100 -> 7200 seconds -> 7200000 milliseconds
  //   */
  //   // formula to convert slider value to seconds
  //   //seconds = Math.floor((value / 100) * 7200);
  //   value = (seconds / 7200) * 100;

  //   return value;
  // }

  useEffect(() => {
    const makeAuthenticatedRequest = async () => {
      try {
        const token = await getAccessTokenSilently();
        const userId = user?.sub || "invalid user";

        // TODO: don't send userId, let the backend handle automatically?
        getAccount(userId, token).then((response) => {
          if (response.runningTime.plannedEndTime) {
            if (Date.now() < response.runningTime.plannedEndTime) {
              const timeRemaining = Math.floor(
                (response.runningTime.plannedEndTime - Date.now()) / 1000
              );
              setTimerValue(timeRemaining);
              setTimerRunning(true);
              timerContext.setIsRunning(true);
              timerContext.setTimeRemaining(timeRemaining);
              setMountTimerInput(false);
            } else {
              postTimeEntryStop(response.runningTime.plannedEndTime, token);
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
    };

    makeAuthenticatedRequest();
  }, [getAccessTokenSilently, user?.sub]);

  /* ------------------------- Timer Lifecycle Methods ------------------------ */
  const intervalReference = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // this useEffect is used to start the timer when the timerRunning state is true
    // runs when the timerRunning state changes, along with the timerValue state

    // if the timer is running and the interval reference is null (there is no timer running), start the timer
    // the interval reference is a ref object that the reference to a component (that is mutable)
    // basically an ID reference to the setInterval function that
    // stays alive for the entire lifecycle of the component
    if (timerRunning == true && !intervalReference.current) {
      // we then set the interval reference to a setInterval function that runs every 1000 milliseconds
      intervalReference.current = setInterval(() => {
        // if the timerValue > 0, that means that the timer is still running
        if (timerValue > 0) {
          setTimerValue(timerValue - 1); // decrement the timer value by 1
          setTimerProgressTextValue(
            convertSecondsToProgressTextValue(timerValue - 1) // update the timer display text
          );
          // setTimerProgressWheelValue(
          //   convertSecondsToProgressWheelValue(timerValue - 1) // update the timer display wheel
          // );
          timerContext.setTimeRemaining(timerValue - 1);

          // if the timer value is 0, that means that the timer has finished
          if (timerValue === 0) {
            // we take the reference to the interval (that has stayed alive through each rerender) and clear it
            clearInterval(intervalReference.current!);
            intervalReference.current = null; // clear the timer reference so that a new one can be created
            setTimerRunning(false);
            timerContext.setIsRunning(false);
            setMountTimerInput(true);
            // console.log("Timer Finished");
          }
        } else {
          // this is an edge case where the timer value is 0, but the timer is still running
          setTimerValue(0);
          setTimerProgressTextValue(convertSecondsToProgressTextValue(0));
          // setTimerProgressWheelValue(convertSecondsToProgressWheelValue(0));

          timerContext.setTimeRemaining(timerValue - 1);

          // console.log("Timer finished with " + timerValue + " seconds");

          clearInterval(intervalReference.current!);
          intervalReference.current = null;
          setTimerRunning(false);
          timerContext.setIsRunning(false);
          setMountTimerInput(true);
          // console.log("edge case timer stopped");
        }
      }, 1000);
    }

    // this is a cleanup function that runs when the component is unmounted
    return () => {
      if (intervalReference.current) {
        clearInterval(intervalReference.current);
        intervalReference.current = null;
      }
    };
  }, [timerRunning, timerValue]); // this useEffect runs/is triggered when the timerRunning or timerValue state changes

  /* ----------------------------- Event Handlers ----------------------------- */
  function handleTimerStopButton(): void {
    // console.log("Timer Stopped");

    // make a post request to stop the timer
    getAccessTokenSilently().then((token) => {
      postTimeEntryStop(Date.now(), token);
    });

    // just some extra safety checks to ensure that the timer is stopped
    clearInterval(intervalReference.current!);
    intervalReference.current = null;
    // console.log("Time remaining: " + timerValue + " seconds");
    // you can use the timerValue state to do something with the remaining time if need be

    setTimerRunning(false);
    timerContext.setIsRunning(false);
    setMountTimerInput(true);
    setStart(undefined);
  }
  function handleTimerStartButton(): void {

    if (timerValue == 0) {
      notifications.show({
        title: "Unable to start timer",
        message: "Pick a time!",
        color: "red",
        withBorder: true
      })
      return;
    }

    const newTimeEntry = new TimeEntry(
      "NULL",
      Date.now(),
      Date.now() + timerValue * 1000,
      selectedProject?.id || "",
      task,
      -1
    );
    getAccessTokenSilently().then((token) => {
      postTimeEntryStart(newTimeEntry, token);
    });

    setStart(Date.now());

    // console.log(
    //   "Timer Started for " + convertSecondsToProgressTextValue(timerValue)
    // );

    // the amount of time the timer will run for is set in the timerValue state so use that

    setTimerRunning(true); // sets the trigger to start the timer
    timerContext.setIsRunning(true);
    setMountTimerInput(false);
    // console.log("inside timer start");
    // console.log(timerContext.getIsRunning());
  }
  function handleTimerSlider(value: number): void {
    // if rounding is enabled, it shows even when the value is 0
    // therefore we need to disable it when the value is 0
    if (value !== 0) {
      // setTimerProgressWheelRounding(true);
    } else {
      // setTimerProgressWheelRounding(false);
    }

    let seconds = convertSliderValueToSeconds(value);
    setTimerValue(seconds);
    setTimerProgressTextValue(convertSecondsToProgressTextValue(seconds));
    // setTimerProgressWheelValue(convertSecondsToProgressWheelValue(seconds));
  }

  /* ------------------------------- Components ------------------------------- */
  function timerProgressText(): JSX.Element {
    return (
      <>
        <Title order={1} size={80}>
          <Text
            inherit
            span
            fw={900}
            c={"#f5ad14"}
          >
            {timerProgressTextValue}
          </Text>
        </Title>
      </>
    );
  }
  function timerStartButton(): JSX.Element {
    return (
      <>
        <Button
          size="xl"
          w={300}
          h={40}
          onClick={handleTimerStartButton}
          variant="filled"
          color="#f5ad14"
        >
          START
        </Button>
      </>
    );
  }
  function timerStopButton(): JSX.Element {
    return (
      <>
        <Button
          size="xl"
          w={300}
          h={40}
          onClick={handleTimerStopButton}
          variant="filled"
          color="#f5ad14"
          mt={10}
        >
          STOP
        </Button>
      </>
    );
  }
  function timerProgressWheel(): JSX.Element {
    return (
      <>
        <Center>
          <Flex
            direction={"column"}
            justify={"center"}
            align={"center"}
            w={"100%"}
            flex={1}
          >
            {timerProgressText()}

            <Transition
              mounted={!mountTimerInput}
              transition={"slide-down"}
              duration={500}
              timingFunction="ease"
              keepMounted
            >
              {(transitionStyle) => (
                <Flex
                  style={{ ...transitionStyle, zIndex: 1 }}
                  w={"100%"}
                  justify={"center"}
                  align={"center"}
                  direction={"row"}
                >
                  {timerStopButton()}
                </Flex>
              )}
            </Transition>
          </Flex>
        </Center>
        {/*  <RingProgress
          size={600}
          thickness={30}
          roundCaps={timerProgressWheelRounding}
          sections={[
            { value: timerProgressWheelValue, color: "rgba(255, 157, 71, 1)" },
          ]}
          label={
            
          }
        /> */}
      </>
    );
  }
  function timerSlider(): JSX.Element {
    const maxValue: number = 120;
    const marks = [
      { value: 0, label: "0" },
      { value: 30, label: "30" },
      { value: 60, label: "60" },
      { value: 90, label: "90" },
      { value: 120, label: "120" },
    ];

    return (
      <>
        <Slider
          w={300}
          showLabelOnHover={false}
          color={"#f5ad14"}
          onChange={(value) => handleTimerSlider(value)}
          max={maxValue}
          marks={marks}
        />
      </>
    );
  }

  return (
    <>
      <Flex
        direction={"column"}
      >
        {timerProgressWheel()}

        <Transition
          mounted={mountTimerInput}
          transition={"slide-up"}
          duration={200}
          timingFunction="ease"
          keepMounted
        >
          {(transitionStyle) => (
            <Flex
              style={{ ...transitionStyle, zIndex: 1 }}
              direction={"column"}
            >
              {timerSlider()}
              <Space h={40} />
              {timerStartButton()}
            </Flex>
          )}
        </Transition>
      </Flex>
    </>
  );
}
