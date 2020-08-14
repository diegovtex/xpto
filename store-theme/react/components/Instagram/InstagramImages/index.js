import React, { useEffect, useState, Fragment } from 'react';

import { instagram } from '../../../utils';

import InstagramImage from '../InstagramImage';

import styles from './instagram-images.css'

const InstagramImages = ({ instagramApiKey }) => {

	const request = instagram(instagramApiKey)
	const [images, setImages] = useState([]);

	async function getImages() {
		try {
			const res = await request.getMediaDetail()
			console.log(res)
			return res
		} catch (err) {
			console.error(err)
		}
	}

	useEffect(() => {
		getImages().then(data => setImages(data))
	}, [])

	const Images = () => {
		if (images.length) {
			return (
				<div className={styles["instagram-images-wrapper"]}>
					{images.map(image => <InstagramImage alt={image.caption} url={image.media_url} />)}
				</div>
			)
		}
		return <Fragment />
	}
	return <Images />
}


InstagramImages.schema = {
	title: "Instagram Images",
	description: "Instagram Images",
	type: "object",
	properties: {
		"instagramApiKey": {
			"title": "Instagram API Key",
			"type": "string"
		}
	}
};

export default InstagramImages