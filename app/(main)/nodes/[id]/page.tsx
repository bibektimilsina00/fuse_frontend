import React from 'react';
import EditNodeClient from './EditNodeClient';

// For static export
export const dynamicParams = false;
export async function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

export default function EditNodePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    const nodeId = resolvedParams.id;

    return <EditNodeClient nodeId={nodeId} />;
}
