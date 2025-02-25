import {useEffect, useState} from "react";

const useInactivity = (timeout = 10) => {
    const [isInactive, setIsInactive] = useState(false);

    useEffect(() => {
        let timer;

        const resetTimer = () => {
            setIsInactive(false);
            clearTimeout(timer);
            timer = setTimeout(() => setIsInactive(true), timeout * 1000);
        };

        // List of events that reset inactivity
        const events = ["mousemove", "keydown", "scroll", "click"];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer(); // Initialize the timer

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            clearTimeout(timer);
        };
    }, [timeout]);

    return isInactive;
};

export default useInactivity;