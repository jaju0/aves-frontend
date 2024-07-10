import { useRef, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { UserData, UserRank, userRank } from "../../provider/QueriesWithAuthProvider/datatypes";
import { UsersPageLoaderResponse } from "./loader";
import { SubmitInput } from "../../components/inputs/SubmitInput";
import { EmailInput } from "../../components/inputs/EmailInput";
import { CircleSpinner } from "../../components/CircleSpinner";
import { useQueryFunctionsWithAuth } from "../../hooks/useQueryFunctionsWithAuth";

export interface UserFormData
{
    email: string;
    rank: UserRank;
}

export interface UsersPageState
{
    createUserSpinnerVisible: boolean;
    changeUserSpinnerVisible: boolean;
    deleteUserSpinnerVisible: boolean;
    isChangeModeActivated: boolean;
    user?: UserData;
}

export interface UserAmendmentData
{
    email: string;
    rank: UserRank;
}

export function UsersPage()
{
    const queryFunctionsWithAuth = useQueryFunctionsWithAuth();
    const { userDataResponse, usersListDataResponse } = useLoaderData() as UsersPageLoaderResponse;
    const createUserMutation = useMutation(queryFunctionsWithAuth.createUserMutation);
    const amendUserMutation = useMutation(queryFunctionsWithAuth.amendUserMutation);
    const deleteUserMutation = useMutation(queryFunctionsWithAuth.deleteUserMutation);
    const userAmendmentDataRef = useRef<UserAmendmentData>();
    const { revalidate } = useRevalidator();

    const [state, setState] = useState<UsersPageState>({
        createUserSpinnerVisible: false,
        changeUserSpinnerVisible: false,
        deleteUserSpinnerVisible: false,
        isChangeModeActivated: false,
        user: undefined,
    });

    const formik = useFormik<UserFormData>({
        initialValues: {
            email: "",
            rank: "NONE",
        },
        validationSchema: Yup.object({
            email: Yup.string().email().required("Mandatory Field"),
            rank: Yup.string().oneOf(userRank).required("Mandatory Field"),
        }),
        onSubmit: values => {
            setState(prev => ({
                ...prev,
                createUserSpinnerVisible: true,
            }));

            createUserMutation.mutateAsync(values).finally(() => {
                setState(prev => ({
                    ...prev,
                    createUserSpinnerVisible: false,
                }));

                revalidate();
            });
        },
    });

    const deleteUserClicked = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>, user: UserData) => {
        ev.preventDefault();

        setState(prev => ({
            ...prev,
            deleteUserSpinnerVisible: true,
            user,
        }));

        deleteUserMutation.mutateAsync(user.email).finally(() => {
            setState(prev => ({
                ...prev,
                deleteUserSpinnerVisible: false,
                user: undefined,
            }));

            revalidate();
        });
    }

    const changeUserClicked = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>, user: UserData) => {
        ev.preventDefault();
        if(!state.isChangeModeActivated)
        {
            setState(prev => ({
                ...prev,
                isChangeModeActivated: true,
                user,
            }));

            userAmendmentDataRef.current = {
                email: user.email,
                rank: user.rank,
            };

            return;
        }

        if(userAmendmentDataRef.current === undefined)
        {
            setState(prev => ({
                ...prev,
                isChangeModeActivated: false,
                user: undefined,
            }));

            return;
        }

        setState(prev => ({
            ...prev,
            changeUserSpinnerVisible: true,
            user: undefined,
        }));

        amendUserMutation.mutateAsync(userAmendmentDataRef.current).finally(() => {
            setState(prev => ({
                ...prev,
                isChangeModeActivated: false,
                changeUserSpinnerVisible: false,
                user: undefined,
            }));

            revalidate();
        });

        userAmendmentDataRef.current = undefined;
    }

    const userRankChanged = (ev: React.ChangeEvent<HTMLSelectElement>, user: UserData) => {
        ev.preventDefault();
        if(userAmendmentDataRef.current === undefined)
        {
            userAmendmentDataRef.current = {
                email: user.email,
                rank: user.rank,
            };
        }

        userAmendmentDataRef.current.rank = ev.currentTarget.value as UserRank;
    }

    return (
        <div className="w-full h-full">
            <div className="grid gap-5">
                <div className="w-11/12 mx-auto">
                    <form onSubmit={formik.handleSubmit}>
                        <table className="table-fixed w-full text-left">
                            <thead>
                                <tr>
                                    <th>E-Mail Address</th>
                                    <th>Rank</th>
                                    <th>ID</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                { usersListDataResponse?.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.email}</td>
                                        <td>
                                            { state.isChangeModeActivated && state.user?.email === user.email &&
                                                <select
                                                    onChange={ev => userRankChanged(ev, user)}
                                                    className="bg-transparent px-4 py-1 rounded-full border-2"
                                                    >
                                                    <option className="bg-black text-white" value="ADMIN" selected={user.rank === "ADMIN"}>Admin</option>
                                                    <option className="bg-black text-white" value="USER" selected={user.rank === "USER"}>User</option>
                                                    <option className="bg-black text-white" value="NONE" selected={user.rank === "NONE"}>None</option>
                                                </select>
                                            }
                                            { !(state.isChangeModeActivated && state.user?.email === user.email) &&
                                                <span>{user.rank}</span>
                                            }
                                        </td>
                                        <td>{user.id}</td>
                                        <td>
                                            { userDataResponse?.email !== user.email &&
                                                <button onClick={ev => changeUserClicked(ev, user)} className="float-end transition duration-150 ease-in-out delay-100 block px-4 py-1 rounded-full border-2 hover:bg-white hover:text-indigo-400 cursor-pointer">
                                                    { state.isChangeModeActivated && state.user?.email === user.email &&
                                                        <span>Apply</span>
                                                    }
                                                    { !(state.isChangeModeActivated && state.user?.email === user.email) &&
                                                        <span>Change</span>
                                                    }
                                                    { state.changeUserSpinnerVisible && state.user?.email === user.email &&
                                                        <CircleSpinner className="inline-block mx-3" />
                                                    }
                                                </button>
                                            }
                                            { userDataResponse?.email === user.email &&
                                                <div className="float-end px-4 py-1 rounded-full border-2 text-gray-500 border-gray-500">
                                                    You
                                                </div>
                                            }
                                        </td>
                                        <td>
                                            { userDataResponse?.email !== user.email &&
                                                <button onClick={ev => deleteUserClicked(ev, user)} className="float-end transition duration-150 ease-in-out delay-100 block px-4 py-1 rounded-full border-2 hover:bg-white hover:text-indigo-400 cursor-pointer">
                                                    <span>Delete</span>
                                                    { state.deleteUserSpinnerVisible && state.user?.email === user.email &&
                                                        <CircleSpinner className="inline-block mx-3" />
                                                    }
                                                </button>
                                            }
                                            { userDataResponse?.email === user.email &&
                                                <div className="float-end px-4 py-1 rounded-full border-2 text-gray-500 border-gray-500">
                                                    You
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td>
                                        <EmailInput
                                            placeholder="E-Mail Address"
                                            {...formik.getFieldProps("email")}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="bg-transparent px-4 py-1 rounded-full border-2"
                                            {...formik.getFieldProps("rank")}
                                        >
                                            <option className="bg-black text-white" value="ADMIN">Admin</option>
                                            <option className="bg-black text-white" value="USER">User</option>
                                            <option className="bg-black text-white" value="NONE">None</option>
                                        </select>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <SubmitInput className="float-end">
                                            <span>Create User</span>
                                            { state.createUserSpinnerVisible &&
                                                <CircleSpinner className="inline-block mx-3" />
                                            }
                                        </SubmitInput>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </div>
    );
}