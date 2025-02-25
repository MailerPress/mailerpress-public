import React, {useEffect} from 'react'

export default function ContactDetails({contact}) {

    return (
        <div>
            {contact.email}
        </div>
    )
}