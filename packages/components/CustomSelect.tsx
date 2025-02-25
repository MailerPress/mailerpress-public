import React, {useState, useRef, useEffect} from "react";
import {
    Flex,
    FlexBlock,
    Button
} from "@wordpress/components";
import Tag from "./Tag.tsx";
import {create} from "@wordpress/icons";
import {t} from "../editor/src/utils/function.ts";

const CustomSelect = ({
                          label = "Select an option",
                          initialOptions = [],
                          onCreateOption,
                          onOptionSelect,
                          selection = [],
                          onDelete
                      }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState(initialOptions);
    const [filteredOptions, setFilteredOptions] = useState(initialOptions);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const filtered = initialOptions.filter(obj1 =>
            !selection.some(obj2 => obj1.id === obj2.id)
        );
        setOptions(filtered)
        setFilteredOptions(filtered);
    }, [initialOptions, selection]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        setFilteredOptions(
            options.filter((option) =>
                option.label.toLowerCase().includes(value.toLowerCase())
            )
        );
        setIsOpen(true);
    };

    const handleSelectOption = (option) => {
        onOptionSelect(option);
        setSearch("");
        setIsOpen(false);
    };

    const handleCreateOption = () => {
        if (onCreateOption && search.trim() !== "") {
            const newOption = search.trim();
            onCreateOption(newOption);
            setSearch("");
            setIsOpen(false);
        }
    };

    const handleBlur = (e) => {
        if (!dropdownRef.current.contains(e.relatedTarget)) {
            setIsOpen(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === 'Tab') {
            event.preventDefault(); // Prevent form submission if inside a form
            handleEnterAction(search); // Call your function when Enter is pressed
        }

        if (event.key === "Escape") {
            event.preventDefault(); // Prevent form submission if inside a form
            setIsOpen(false) // Call your function when Enter is pressed
        }
    };

    const handleEnterAction = () => {
        const inputValue = dropdownRef.current.querySelector('.select-input').value
        if (inputValue.length === 0 || inputValue.length < 3) {
        } else {
            if (filteredOptions.length === 0) {
                handleCreateOption()
            }
        }
    };

    return (
        <div className="custom-select-container">
            <label htmlFor="custom-select-input" className="select-label">
                {label}
            </label>
            <div className="custom-select" ref={dropdownRef}>
                <div className="input-wrapper">
                    <input
                        style={{cursor: 'pointer'}}
                        id="custom-select-input"
                        type="text"
                        value={search}
                        onKeyDown={handleKeyDown} // Capture key events
                        onChange={handleSearchChange}
                        onClick={() => setIsOpen(!isOpen)}
                        onBlur={handleBlur}
                        placeholder="Search or create..."
                        className="select-input"
                    />
                    <span className="select-icon">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="#666"
            >
              <path d="M7 10l5 5 5-5H7z"/>
            </svg>
          </span>
                </div>
                {isOpen && (
                    <ul className={`select-dropdown ${isOpen ? "open" : ""}`}>
                        <Flex direction={"column"} spacing={1}>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => (
                                    <FlexBlock>
                                        <Button
                                            style={{width: '100%'}}
                                            size={"compact"}
                                            variant={"tertiary"}
                                            key={index}
                                            onClick={() => handleSelectOption(option)}
                                            className="select-option"
                                        >
                                            {option.label}
                                        </Button>
                                    </FlexBlock>

                                ))
                            ) : search.length > 3 ?
                                <FlexBlock>
                                    <Button
                                        icon={create}
                                        iconPosition='right'
                                        style={{width: '100%'}}
                                        size={"compact"}
                                        variant={"tertiary"}
                                        className="select-option create-option"
                                        onMouseDown={handleCreateOption}
                                    >
                                        {` ${t('Create new option')} "${search}"`}
                                    </Button>
                                </FlexBlock> : <FlexBlock>
                                    <Button
                                        isDestructive
                                        style={{width: '100%'}}
                                        size={"compact"}
                                        variant={"tertiary"}
                                        className="select-option create-option"
                                    >
                                        {`${t('No option found, required at least 3 caracters for creating new one')}`}
                                    </Button>
                                </FlexBlock>
                            }
                        </Flex>
                    </ul>
                )}
            </div>
            {selection.length > 0 && <ul style={{display: 'flex', gap: 8, marginTop: 8}}>
                {selection.map(s =>
                    <Tag
                        onDelete={() => onDelete(s)}
                        isDeletable={onDelete !== undefined}
                        type="info"
                    >
                        {s.label}
                    </Tag>
                )}
            </ul>}
        </div>
    );
};

export default CustomSelect;
