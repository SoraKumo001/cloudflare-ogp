import React from 'react';
import { createOGP } from './createOGP';

export interface Env {}

const outputOGP = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
	const url = new URL(request.url);
	if (url.pathname !== '/') {
		return new Response(null, { status: 404 });
	}

	const name = url.searchParams.get('name') ?? 'Name';
	const title = url.searchParams.get('title') ?? 'Title';
	const image = url.searchParams.get('image');
	const cache = caches.default;
	const cacheKey = new Request(url.toString());
	const cachedResponse = await cache.match(cacheKey);
	if (cachedResponse) {
		return cachedResponse;
	}

	const ogpNode = (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				padding: '16px 24px',
				overflow: 'hidden',
				fontFamily: 'NotoSansJP',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					border: 'solid 16px #0044FF',
					borderRadius: '24px',
					boxSizing: 'border-box',
					background: 'linear-gradient(to bottom right, #ffffff, #d3eef9)',
				}}
			>
				<div
					style={{
						display: 'flex',
						flex: 1,
					}}
				>
					{image && (
						<img
							style={{
								borderRadius: '100%',
								padding: '8px',
								marginRight: '16px',
								position: 'absolute',
								opacity: 0.4,
							}}
							width={480}
							src={image}
							alt=""
						/>
					)}
					<h1
						style={{
							display: 'block',
							flex: 1,
							fontSize: 72,
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0 42px',
							wordBreak: 'break-all',
							textOverflow: 'ellipsis',
							lineClamp: 4,
							lineHeight: '64px',
						}}
					>
						{title}
					</h1>
				</div>
				<div
					style={{
						width: '100%',
						justifyContent: 'flex-end',
						fontSize: 48,
						padding: '0 32px 32px 0',
						color: '#CC3344',
					}}
				>
					{name}
				</div>
			</div>
		</div>
	);
	const png = await createOGP(ogpNode, {
		ctx,
		scale: 0.7,
		width: 1200,
		height: 630,
		fonts: [
			'Noto Sans',
			'Noto Sans Math',
			'Noto Sans Symbols',
			// 'Noto Sans Symbols 2',
			'Noto Sans JP',
			// 'Noto Sans KR',
			// 'Noto Sans SC',
			// 'Noto Sans TC',
			// 'Noto Sans HK',
			// 'Noto Sans Thai',
			// 'Noto Sans Bengali',
			// 'Noto Sans Arabic',
			// 'Noto Sans Tamil',
			// 'Noto Sans Malayalam',
			// 'Noto Sans Hebrew',
			// 'Noto Sans Telugu',
			// 'Noto Sans Devanagari',
			// 'Noto Sans Kannada',
		],
		emojis: [
			{
				url: 'https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/',
			},
			{
				url: 'https://openmoji.org/data/color/svg/',
			},
		],
	});
	const response = new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
			date: new Date().toUTCString(),
		},
		cf: {
			cacheEverything: true,
			cacheTtl: 31536000,
		},
	});
	ctx.waitUntil(cache.put(cacheKey, response.clone()));
	return response;
};

export default {
	fetch: outputOGP,
};
