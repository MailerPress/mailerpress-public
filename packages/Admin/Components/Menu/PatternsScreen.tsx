import React, {useEffect} from "react"
import HeaderNavigator from "./HeaderNavigator.tsx";

const PatternsScreen = ({onLoad}) => {

    useEffect(() => {
        onLoad()
    }, []);

    return (
        <div>
            <HeaderNavigator
                title={"Patterns"}
                helpText={"Manage what patterns are available when editing the email."}
            />
        </div>
    )
}
export default PatternsScreen