import { UserInvestmentsClient } from "./UserInvestmentsClient";

export default function UserInvestmentsPage() {
    return <UserInvestmentsClient />;
}


export const revalidate = 3600;
