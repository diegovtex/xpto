import React from 'react'

const AnchorComponent = ({ children, anchorTo, offset = 100 }) => {
    const handleClick = event => {
        event.preventDefault();

        const y = document.querySelector(anchorTo).getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    return (
        <a href={"#" + anchorTo.replace(".", "").replace("#", "")} onClick={handleClick} style={{
            color: "inherit",
            textDecoration: "none"
        }}>{children}</a>
    )
}

export default AnchorComponent