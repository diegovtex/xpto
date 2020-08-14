import React from 'react';

import styles from './instagram-image.css'

const InstagramImage =  ({ alt, url }) => {
	return (
		<div className={styles["content"]}>
			<img src={url} alt={alt} />
		</div>
	)
}

export default InstagramImage