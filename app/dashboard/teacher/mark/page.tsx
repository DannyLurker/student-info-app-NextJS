
import React from 'react';
import { auth } from '@/lib/auth/authNode';
import MarkManagement from '@/components/dashboard/teacher/MarkManagement';


const page = async () => {
    const session = await auth();

    if (!session) return null;

    return (
        <MarkManagement session={session.user} />
    );
}

export default page
