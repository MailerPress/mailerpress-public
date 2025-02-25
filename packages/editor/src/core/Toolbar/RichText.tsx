import React, {useState, useEffect, useMemo} from "react";
import {
    ToolbarButton,
    Popover,
    MenuGroup,
    MenuItemsChoice
} from "@wordpress/components";
import {select, useDispatch} from "@wordpress/data";
import {
    __experimentalLinkControl as LinkControl
} from "@wordpress/block-editor";
import {formatBold, formatItalic, formatUnderline, link, connection, formatStrikethrough} from "@wordpress/icons";
import {__} from '@wordpress/i18n';
import {useSelection} from "../../context/SelectionProvider.tsx";
import {updateDataByClientId} from "../../utils/block.ts";
import {STORE_KEY} from "../../constants.ts";
import {SelectControl} from "../../UI/Settings";

const mergedTagsList = [
    {
        label: __('Contact tag', 'mailerpress'),
        type: 'contact',
        data: [
            {label: __('Contact email', 'mailerpresss'), value: 'contact_email'},
            {label: __('Contact firstName', 'mailerpresss'), value: 'contact_first_name'},
            {label: __('Contact lastName', 'mailerpresss'), value: 'contact_last_name'},
            {label: __('Contact fullName', 'mailerpresss'), value: 'contact_name'},
        ]
    },
    {
        label: __('Order tag', 'mailerpress'),
        type: 'order',
        data: []
    }
]

const UrlPopover = ({onAddLink, selectedLink, onFocusOutside, onRemoveLink}) => {
    const [attributes, setAttributes] = useState({post: selectedLink !== '' ? {url: selectedLink} : ''})

    useEffect(() => {
        if (attributes.post !== '' && selectedLink !== attributes.post.url) {
            onAddLink(attributes.post.url)
        } else {
            onAddLink('')
        }
    }, [attributes]);

    useEffect(() => {
        console.log('load')
    }, []);

    return (
        <Popover onFocusOutside={onFocusOutside} offset={8}>
            <LinkControl
                onRemove={onRemoveLink}
                value={attributes.post}
                searchInputPlaceholder="Search here..."
                onChange={(newPost) => setAttributes({post: newPost})}
            />
        </Popover>
    )
}
const MergedTagModal = ({onSelect}) => {

    const [tagType, setTagType] = useState('contact')

    const tagData = useMemo(() => {
        if (mergedTagsList && mergedTagsList.find(m => m.type === tagType)) {
            return mergedTagsList.find(m => m.type === tagType)
        }

        return null
    }, [tagType]);

    return (
        <div style={{width: '100%'}}>
            <SelectControl
                value={tagType}
                label={__('Merged tag type', 'mailerpress')}
                onChange={setTagType}
                options={Object.values(mergedTagsList).reduce((acc, item) => {
                    acc.push({label: item.label, value: item.value})
                    return acc
                }, [])
                }
            />
            {tagData && tagData.data.length > 0 &&
                <div style={{
                    background: '#f7f7f7',
                    marginTop: 8,
                    borderRadius: 6
                }}>
                    <MenuGroup>
                        <MenuItemsChoice
                            choices={tagData.data.reduce((acc, item) => {
                                acc.push({
                                    label: item.label,
                                    value: item.value
                                })
                                return acc
                            }, [])
                            }
                            onSelect={onSelect}
                        />
                    </MenuGroup>
                </div>
            }
        </div>

    )
}

const RichText = ({editable, support}) => {
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isMergedTag, setIsMergedTag] = useState(false);
    const [urlPopover, setUrlPopover] = useState(false)
    const [mergedTagPopover, setMergedTagPopover] = useState(false)
    const [savedSelection, setSavedSelection] = useState(null); // Track the saved selection
    const {setDraft} = useDispatch(STORE_KEY);
    const {setModal} = useDispatch(STORE_KEY)


    // Function to apply style
    const applyStyle = (style) => {
        document.execCommand(style);
        handleSaveDraft()
        updateToolbarButtonState();
    };

    const handleSaveDraft = () => {
        const content = document.querySelector(`.node-client-${editable.block.clientId} > div`).innerHTML
        const data = updateDataByClientId(
            select(STORE_KEY).getBlocks(),
            editable.block.clientId,
            {content}
        )
        setDraft(data)
    }

    // Function to update toolbar button state
    const updateToolbarButtonState = () => {
        const selection = window.getSelection();

        // If no selection or empty selection, reset everything to false
        if (!selection.rangeCount || selection.toString().trim() === "") {
            setIsBold(false);
            setIsItalic(false);
            setIsUnderline(false);
            setIsLink(false);
            setIsStrikethrough(false);
            setIsMergedTag(false);
            return;
        }

        let isBold = false;
        let isItalic = false;
        let isUnderline = false;
        let isLink = false;
        let isStrikethrough = false;
        let isMergedTag = false;

        const range = selection.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer;

        let node = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentElement : commonAncestor;

        // Function to check if selection is **completely** inside `{{ ... }}`
        const checkIfInsideMergeTag = () => {
            const selectedText = selection.toString().trim();

            // Ensure selected text fully contains `{{` and `}}`
            if (selectedText.startsWith("{{") && selectedText.endsWith("}}")) {
                return true;
            }

            // Check if the selection is fully **inside** a text node that contains `{{ ... }}`
            let currentNode = range.startContainer;
            while (currentNode) {
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    const text = currentNode.nodeValue.trim();
                    if (text.includes("{{") && text.includes("}}")) {
                        const startIndex = text.indexOf("{{");
                        const endIndex = text.indexOf("}}") + 2; // Include `}}`

                        // Ensure the selection is completely inside `{{ ... }}`
                        if (range.startOffset >= startIndex && range.endOffset <= endIndex) {
                            return true;
                        }
                    }
                }
                currentNode = currentNode.parentElement;
            }

            return false;
        };

        isMergedTag = checkIfInsideMergeTag();

        // Traverse up the DOM tree to check for formatting tags
        while (node) {
            if (node.tagName === 'B' || node.tagName === 'STRONG') isBold = true;
            if (node.tagName === 'I' || node.tagName === 'EM') isItalic = true;
            if (node.tagName === 'U') isUnderline = true;
            if (node.tagName === 'A') isLink = true;
            if (node.tagName === 'S' || node.tagName === 'STRIKE' || node.tagName === 'DEL') isStrikethrough = true;

            node = node.parentElement;
        }

        // Update the state
        setIsBold(isBold);
        setIsItalic(isItalic);
        setIsUnderline(isUnderline);
        setIsLink(isLink);
        setIsStrikethrough(isStrikethrough);
        setIsMergedTag(isMergedTag);
    };

    useEffect(() => {
        // Update the button states on initial load
        updateToolbarButtonState();

        // Listen for selection change to update button states
        const onSelectionChange = () => {
            if (true === urlPopover) {
                setUrlPopover(false)
            }
            updateToolbarButtonState();
        };

        // Attach the selection change listener
        document.addEventListener('selectionchange', onSelectionChange);

        return () => {
            // Clean up the listener on unmount
            document.removeEventListener('selectionchange', onSelectionChange);
        };
    }, []);

    const handleUrlPopover = () => {
        const selection = window.getSelection();

        // Check if there is any text selected
        if (selection.rangeCount > 0 && selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0);
            setSavedSelection(range); // Save the selection range
            setUrlPopover(!urlPopover); // Toggle the popover
        } else {
            setUrlPopover(false); // Toggle the popover
        }
    };

    const handleAddLink = (value) => {
        if (value && savedSelection) {
            // Restore the saved selection
            const selection = window.getSelection();
            selection.removeAllRanges(); // Clear current selection
            selection.addRange(savedSelection); // Restore saved selection

            const range = selection.getRangeAt(0);
            const selectedNode = range.startContainer.parentNode;

            // Check if the selected content is already a link
            if (selectedNode && selectedNode.nodeName === 'A') {
                // If it's already a link, update the href attribute
                selectedNode.href = value;
            } else {
                // If it's not a link, create a new link node and insert it
                const linkNode = document.createElement('a');
                linkNode.href = value;
                linkNode.target = '_blank';
                linkNode.textContent = selection.toString();

                // Delete the selected content and insert the new link
                range.deleteContents();
                range.insertNode(linkNode);

                // Move the caret to the end of the inserted link
                range.setStartAfter(linkNode);
                range.setEndAfter(linkNode);
            }

            // Restore the selection
            selection.removeAllRanges();
            selection.addRange(range);

            handleSaveDraft();

            // Close the popover and reset state
            setUrlPopover(false);
            updateToolbarButtonState();
        }
    };

    const handleRemoveLink = () => {
        if (savedSelection) {
            // Restore the saved selection
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedSelection);

            const range = selection.getRangeAt(0);
            let selectedNode = range.startContainer.parentNode;

            // Check if the selected content is inside an <a> tag
            if (selectedNode && selectedNode.nodeName === 'A') {
                const textNode = document.createTextNode(selectedNode.textContent);
                const parent = selectedNode.parentNode;

                // Replace the <a> tag with its text content
                parent.replaceChild(textNode, selectedNode);

                // Restore the selection around the new text node
                range.selectNodeContents(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            handleSaveDraft();
            updateToolbarButtonState();
            setUrlPopover(false)
        }
    };

    const getSelectedLink = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return '';

        // Check if the selected node contains a link
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        let linkNode = container.nodeType === 1
            ? container.closest('a')
            : container.parentNode.closest('a');

        return linkNode ? linkNode.getAttribute('href') : '';
    };

    // Handle the insertion of a merge tag
    const setMergeTag = (value) => {
        const selection = window.getSelection();
        if (!selection.rangeCount && editable === null) return;

        const contentEditable = document.querySelector(`.node-client-${editable.block.clientId} > [contenteditable="true"]`);
        if (!contentEditable) return;

        const range = selection.getRangeAt(0);
        const selectedText = selection.toString().trim();

        // Vérifie si le texte sélectionné est déjà un tag {{...}}
        const mergeTagRegex = /\{\{(.*?)\}\}/g;
        let parentNode = range.commonAncestorContainer;

        // Si le parent est un nœud de texte, remonter à l'élément parent
        if (parentNode.nodeType === Node.TEXT_NODE) {
            parentNode = parentNode.parentElement;
        }

        const parentTextContent = parentNode.textContent;

        // Vérifie si la sélection est dans un merge tag existant
        const mergeTagMatch = parentTextContent.match(mergeTagRegex);

        if (mergeTagMatch && mergeTagMatch.length > 0 && selectedText) {
            // Si le texte sélectionné fait partie d'un merge tag existant
            // Remplacer uniquement le contenu du tag sélectionné
            mergeTagMatch.forEach((match) => {
                if (parentTextContent.includes(match) && selectedText === match.slice(2, -2)) {
                    parentNode.textContent = parentTextContent.replace(match, `{{${value}}}`);
                }
            });
        } else {
            // Si aucun merge tag n'est trouvé, insère un nouveau merge tag à l'emplacement du curseur
            range.deleteContents(); // Supprime le texte sélectionné

            // Crée et insère le nouveau merge tag à la sélection
            const newTextNode = document.createTextNode(`{{${value}}}`);
            range.insertNode(newTextNode);

            // Déplace le curseur après le tag inséré
            range.setStartAfter(newTextNode);
            range.setEndAfter(newTextNode);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // Enregistrer les modifications
        handleSaveDraft();
    };

    return (
        <>
            {(support === undefined || support.includes('b')) &&
                <ToolbarButton
                    isPressed={isBold}
                    icon={formatBold}
                    onClick={() => applyStyle('bold')}
                    title={__('Bold', 'mailerpress')}
                />
            }

            {(support === undefined || support.includes('i')) &&
                <ToolbarButton
                    isPressed={isItalic}
                    icon={formatItalic}
                    onClick={() => applyStyle('italic')}
                    title={__('Italic', 'mailerpress')}
                />
            }

            {(support === undefined || support.includes('u')) &&
                <ToolbarButton
                    isPressed={isUnderline}
                    icon={formatUnderline}
                    onClick={() => applyStyle('underline')}
                    title={__('Underline', 'mailerpress')}
                />
            }

            {(support === undefined || support.includes('s')) &&
                <ToolbarButton
                    isPressed={isStrikethrough}
                    icon={formatStrikethrough}
                    onClick={() => applyStyle('strikethrough')}
                    title={__('Strikethrough', 'mailerpress')}
                />
            }

            {(support === undefined || support.includes('a')) &&
                <>
                    <ToolbarButton
                        isPressed={isLink}
                        icon={link}
                        onClick={handleUrlPopover}
                        title={__('Link', 'mailerpress')}
                    />
                    {urlPopover && (
                        <UrlPopover
                            onRemoveLink={handleRemoveLink}
                            onFocusOutside={() => setUrlPopover(false)}
                            onAddLink={handleAddLink}
                            selectedLink={getSelectedLink()}
                        />
                    )}
                </>
            }

            {(support === undefined || support.includes('mergedTag')) &&

                <>
                    <ToolbarButton
                        icon={connection}
                        isPressed={isMergedTag}
                        onClick={() => setModal({
                            className: "modal-full-h",
                            title: __('Insert merged tag', 'mailerpress'),
                            size: 'small',
                            component: <MergedTagModal
                                onSelect={value => {
                                    setModal(null)
                                    setMergeTag(value)
                                }}
                            />
                        })}
                        title={__('Merged tag', 'mailerpress')}
                    />
                </>
            }
        </>
    );
};

export default RichText;
