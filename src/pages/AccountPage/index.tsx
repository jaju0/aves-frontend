import { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AccountPageLoaderResponse } from "./loader";
import { TextInput } from "../../components/inputs/TextInput";
import { SubmitInput } from "../../components/inputs/SubmitInput";
import { Credential, accountCredentialsActivationMutation, accountCredentialsDeletionMutation, accountCredentialsSubmitionMutation } from "../../queries";
import { CircleSpinner } from "../../components/CircleSpinner";
import { useMutation } from "@tanstack/react-query";

export interface AccountPageState
{
    addSpinnerVisible: boolean;
    activateSpinnerVisible: boolean;
    deleteSpinnerVisible: boolean;
    selectedCredential?: Credential;
}

export function AccountPage()
{
    const { userDataResponse, credentialsResponse } = useLoaderData() as AccountPageLoaderResponse;
    const addCredentialMutation = useMutation(accountCredentialsSubmitionMutation);
    const deleteCredentialMutation = useMutation(accountCredentialsDeletionMutation);
    const activateCredentialMutation = useMutation(accountCredentialsActivationMutation);
    const { revalidate } = useRevalidator();

    const [state, setState] = useState<AccountPageState>({
        addSpinnerVisible: false,
        activateSpinnerVisible: false,
        deleteSpinnerVisible: false,
        selectedCredential: undefined,
    });

    const formik = useFormik<Credential>({
        initialValues: {
            key: "",
            secret: "",
            demoTrading: false,
            isActive: false,
        },
        validationSchema: Yup.object({
            key: Yup.string().required("Mandatory Field"),
            secret: Yup.string().required("Mandatory Field"),
            demoTrading: Yup.boolean().required("Mandatory Field"),
            isActive: Yup.boolean().required("Mandatory Field"),
        }),
        onSubmit: values => {
            setState(prev => ({
                ...prev,
                addSpinnerVisible: true,
            }));

            addCredentialMutation.mutateAsync({
                credentials: [values],
            }).finally(() => {
                setState(prev => ({
                    ...prev,
                    addSpinnerVisible: false,
                }));

                revalidate();
            });
        },
    });

    const activateCredentialClicked = (ev: React.MouseEvent<HTMLButtonElement>, credential: Credential) => {
        ev.preventDefault();

        setState(prev => ({
            ...prev,
            activateSpinnerVisible: true,
            selectedCredential: credential,
        }));

        activateCredentialMutation.mutateAsync({
            key: credential.key,
        }).finally(() => {
            setState(prev => ({
                ...prev,
                activateSpinnerVisible: false,
                selectedCredential: credential,
            }));

            revalidate();
        });
    }

    const deleteCredentialClicked = (ev: React.MouseEvent<HTMLButtonElement>, credential: Credential) => {
        ev.preventDefault();

        setState(prev => ({
            ...prev,
            deleteSpinnerVisible: true,
            selectedCredential: credential,
        }));

        deleteCredentialMutation.mutateAsync({
            key: credential.key,
        }).finally(() => {
            setState(prev => ({
                ...prev,
                deleteSpinnerVisible: false,
                selectedCredential: undefined,
            }));

            revalidate();
        });
    }

    return (
        <div className="w-full h-full">
            <div className="grid gap-5">
                <div className="grid gap-5 w-[640px] mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5">
                    <p className="text-xl text-center font-semibold">Account Data</p>
                    <table className="table-auto w-full">
                        <tbody>
                            <tr>
                                <td>User ID:</td>
                                <td>{userDataResponse?.id}</td>
                            </tr>
                            <tr>
                                <td>E-Mail Address:</td>
                                <td>{userDataResponse?.email}</td>
                            </tr>
                            <tr>
                                <td>Rank:</td>
                                <td>{userDataResponse?.rank}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="grid gap-5 w-[640px] mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5">
                    <p className="text-xl text-center font-semibold">Credentials</p>
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <td className="font-bold">Key</td>
                                <td className="font-bold">Demo Trading</td>
                                <td className="font-bold"></td>
                                <td className="font-bold"></td>
                            </tr>
                        </thead>
                        <tbody>
                            { credentialsResponse &&
                                credentialsResponse.credentials.map((credential, index) => (
                                    <tr key={index}>
                                        <td className={credential.isActive ? "font-bold" : ""}>{credential.key}</td>
                                        <td className={credential.isActive ? "font-bold" : ""}>{credential.demoTrading ? "true" : "false"}</td>
                                        <td>
                                            { !credential.isActive && 
                                                <button onClick={ev => activateCredentialClicked(ev, credential)} className="float-end transition duration-150 ease-in-out delay-100 block px-4 py-1 rounded-full border-2 hover:bg-white hover:text-indigo-400 cursor-pointer">
                                                    <span>Activate</span>
                                                    { state.activateSpinnerVisible && state.selectedCredential?.key === credential.key &&
                                                        <CircleSpinner className="inline-block mx-3" />
                                                    }
                                                </button>
                                            }
                                        </td>
                                        <td>
                                            <button onClick={ev => deleteCredentialClicked(ev, credential)} className="float-end transition duration-150 ease-in-out delay-100 block px-4 py-1 rounded-full border-2 hover:bg-white hover:text-indigo-400 cursor-pointer">
                                                <span>Delete</span>
                                                { state.deleteSpinnerVisible && state.selectedCredential?.key === credential.key &&
                                                    <CircleSpinner className="inline-block mx-3" />
                                                }
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    <div className="grid gap-2">
                        <p className="text-md font-semibold">Add</p>
                        <form className="grid gap-3" onSubmit={formik.handleSubmit}>
                            <div>
                                <TextInput
                                    placeholder="Key"
                                    {...formik.getFieldProps("key")}
                                    className={`${formik.touched.key && formik.errors.key ? "ring-[1px] ring-red-500" : "text-inherit"}`}
                                />
                                { formik.touched.key && formik.errors.key && 
                                    <p className="text-red-500">*{formik.errors.key}</p>
                                }
                            </div>
                            <div>
                                <TextInput
                                    placeholder="Secret"
                                    {...formik.getFieldProps("secret")}
                                    className={`${formik.touched.secret && formik.errors.secret ? "ring-[1px] ring-red-500" : "text-inherit"}`}
                                />
                                { formik.touched.secret && formik.errors.secret && 
                                    <p className="text-red-500">*{formik.errors.secret}</p>
                                }
                            </div>
                            <label>
                                <input
                                    type="checkbox"
                                    className="me-2"
                                    {...formik.getFieldProps("demoTrading")}
                                />
                                Demo Trading
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    className="me-2"
                                    {...formik.getFieldProps("isActive")}
                                />
                                Set Active
                            </label>
                            <SubmitInput>
                                <span>Add Credential</span>
                                { state.addSpinnerVisible &&
                                    <CircleSpinner className="inline-block mx-3" />
                                }
                            </SubmitInput>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}