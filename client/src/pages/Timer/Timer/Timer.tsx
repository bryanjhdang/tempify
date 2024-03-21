import { useState, useEffect, useRef } from "react";
import {
  RingProgress,
  Title,
  Text,
  Slider,
  Center,
  Flex,
  Button,
  Space,
  Transition,
  ActionIcon,
} from "@mantine/core";
import { IconPlayerStop } from "@tabler/icons-react";
import { getAccount, getProjects, postTimeEntryStart, postTimeEntryStop } from "../../../classes/HTTPhelpers";
import { Project, TimeEntry } from "../../../classes/models";

interface TimerProps {
  task: string,
  selectedProject: Project | null;
}

export function Timer({ task, selectedProject }: TimerProps): JSX.Element {
  /* ---------------------------------- State --------------------------------- */
  const [timerValue, setTimerValue] = useState<number>(0); // in seconds
  const [timerProgressTextValue, setTimerProgressTextValue] =
    useState<string>(`0:00`);
  const [timerProgressWheelValue, setTimerProgressWheelValue] =
    useState<number>(0);
  const [timerProgressWheelRounding, setTimerProgressWheelRounding] =
    useState<boolean>(false);

  const [mountTimerInput, setMountTimerInput] = useState<boolean>(true);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

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
  function convertSecondsToProgressWheelValue(seconds: number): number {
    let value: number = 0;

    /* 
        ring progress value to minutes mapping (as ring only goes up to 100)
        0 -> 0
        25 -> 30 minutes
        50 -> 60 minutes
        75 -> 90 minutes
        100 -> 120 minutes
        therefore slider value to seconds and milliseconds mapping is:
        0 -> 0
        25 -> 1800 seconds -> 1800000 milliseconds
        50 -> 3600 seconds -> 3600000 milliseconds
        75 -> 5400 seconds -> 5400000 milliseconds
        100 -> 7200 seconds -> 7200000 milliseconds
    */
    // formula to convert slider value to seconds
    //seconds = Math.floor((value / 100) * 7200);
    value = (seconds / 7200) * 100;

    return value;
  }

  useEffect(() => {
    getAccount("nemLmP1npemf5VSzAKRC").then(
      (response) => {        
        if (response.currentTimeEntry) {
          if (Date.now() < response.currentTimeEntry.endTime) {
            const timeRemaining = Math.floor((response.currentTimeEntry.endTime - Date.now())/1000);
            setTimerValue(timeRemaining); 
            setTimerRunning(true);
            setMountTimerInput(false);
          } else {
            postTimeEntryStop(response.currentTimeEntry.endTime);
          }
        }
      }
    )
  }, [])

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
          console.log("Time remaining: " + timerValue + " seconds");
          setTimerProgressTextValue(
            convertSecondsToProgressTextValue(timerValue - 1) // update the timer display text
          );
          setTimerProgressWheelValue(
            convertSecondsToProgressWheelValue(timerValue - 1) // update the timer display wheel
          );

          // if the timer value is 0, that means that the timer has finished
          if (timerValue === 0) {
            // we take the reference to the interval (that has stayed alive through each rerender) and clear it
            clearInterval(intervalReference.current!);
            intervalReference.current = null; // clear the timer reference so that a new one can be created
            setTimerRunning(false);
            setMountTimerInput(true);
            console.log("Timer Finished");
          }
        } else {
          // this is an edge case where the timer value is 0, but the timer is still running
          setTimerValue(0);
          setTimerProgressTextValue(convertSecondsToProgressTextValue(0));
          setTimerProgressWheelValue(convertSecondsToProgressWheelValue(0));

          console.log("Timer finished with " + timerValue + " seconds");

          clearInterval(intervalReference.current!);
          intervalReference.current = null;
          setTimerRunning(false);
          setMountTimerInput(true);
          console.log("edge case timer stopped");
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
    console.log("Timer Stopped");

    // make a post request to stop the timer
    postTimeEntryStop(Date.now());

    // just some extra safety checks to ensure that the timer is stopped
    clearInterval(intervalReference.current!);
    intervalReference.current = null;
    console.log("Time remaining: " + timerValue + " seconds");
    // you can use the timerValue state to do something with the remaining time if need be

    setTimerRunning(false);
    setMountTimerInput(true);
  }
  function handleTimerStartButton(): void {
    const newTimeEntry = new TimeEntry(
      "NULL",
      Date.now(),
      Date.now() + (timerValue * 1000),
      selectedProject?.id || "",
      task,
      -1
    );
    postTimeEntryStart(newTimeEntry);

    console.log(
      "Timer Started for " + convertSecondsToProgressTextValue(timerValue)
    );

    // the amount of time the timer will run for is set in the timerValue state so use that

    setTimerRunning(true); // sets the trigger to start the timer
    setMountTimerInput(false);
  }
  function handleTimerSlider(value: number): void {
    // if rounding is enabled, it shows even when the value is 0
    // therefore we need to disable it when the value is 0
    if (value !== 0) {
      setTimerProgressWheelRounding(true);
    } else {
      setTimerProgressWheelRounding(false);
    }

    let seconds = convertSliderValueToSeconds(value);
    setTimerValue(seconds);
    setTimerProgressTextValue(convertSecondsToProgressTextValue(seconds));
    setTimerProgressWheelValue(convertSecondsToProgressWheelValue(seconds));
  }

  /* ------------------------------- Components ------------------------------- */
  function timerProgressText(): JSX.Element {
    return (
      <>
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
          w={"50%"}
          onClick={handleTimerStartButton}
          variant="gradient"
          gradient={{
            from: "yellow",
            to: "orange",
            deg: 90,
          }}
        >
          START
        </Button>
      </>
    );
  }
  function timerStopButton(): JSX.Element {
    return (
      <>
        <ActionIcon
          variant="default"
          bg={"red"}
          size="xl"
          onClick={handleTimerStopButton}
        >
          <IconPlayerStop />
        </ActionIcon>
      </>
    );
  }
  function timerProgressWheel(): JSX.Element {
    return (
      <>
        <RingProgress
          size={600}
          thickness={30}
          roundCaps={timerProgressWheelRounding}
          sections={[
            { value: timerProgressWheelValue, color: "rgba(255, 157, 71, 1)" },
          ]}
          label={
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
                      p={10}
                      direction={"row"}
                      gap={10}
                    >
                      {timerStopButton()}
                    </Flex>
                  )}
                </Transition>
              </Flex>
            </Center>
          }
        />
      </>
    );
  }
  function timerSlider(): JSX.Element {
    const maxValue: number = 120;
    const marks = [
      { value: 0, label: "0 minutes" },
      { value: 5, label: "" },
      { value: 10, label: "" },
      { value: 15, label: "" },
      { value: 20, label: "" },
      { value: 25, label: "" },
      { value: 30, label: "30 minutes" },
      { value: 35, label: "" },
      { value: 40, label: "" },
      { value: 45, label: "" },
      { value: 50, label: "" },
      { value: 55, label: "" },
      { value: 60, label: "60 minutes" },
      { value: 65, label: "" },
      { value: 70, label: "" },
      { value: 75, label: "" },
      { value: 80, label: "" },
      { value: 85, label: "" },
      { value: 90, label: "90 minutes" },
      { value: 95, label: "" },
      { value: 100, label: "" },
      { value: 105, label: "" },
      { value: 110, label: "" },
      { value: 115, label: "" },
      { value: 120, label: "120 minutes" },
    ];

    return (
      <>
        <Slider
          w={"60%"}
          showLabelOnHover={false}
          color={"#f1d179"}
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
        justify={"center"}
        align={"center"}
        w={"100%"}
        flex={1}
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
              w={"100%"}
              justify={"center"}
              align={"center"}
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
