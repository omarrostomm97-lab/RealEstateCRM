import { DeleteIcon, EditIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import CommonDeleteModel from "components/commonDeleteModel";
import CommonCheckTable from "components/reactTable/checktable";
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { deleteManyApi, getApi } from "services/api";
import OwnerForm from "./components/OwnerForm";

const formatLabel = (value) => {
  if (!value) return "-";
  return value
    ?.split("_")
    ?.map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    ?.join(" ");
};

const Owners = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [owners, setOwners] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");
  const [action, setAction] = useState(false);
  const [selectedId, setSelectedId] = useState();
  const [formMode, setFormMode] = useState("add");
  const [deleteModel, setDeleteModel] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);

  const access = {
    create: true,
    update: true,
    delete: true,
    view: true,
    export: true,
  };

  const fetchOwners = async () => {
    try {
      setIsLoding(true);
      setError("");
      const response = await getApi("api/owner");
      if (response?.status === 200) {
        setOwners(response?.data || []);
      } else {
        setError(
          response?.response?.data?.message ||
            response?.response?.data?.error ||
            "Failed to load owners."
        );
      }
    } catch (e) {
      setError(e?.message || "Failed to load owners.");
    } finally {
      setIsLoding(false);
    }
  };

  const openAdd = () => {
    setSelectedId();
    setFormMode("add");
    onOpen();
  };

  const openEdit = (id) => {
    setSelectedId(id);
    setFormMode("edit");
    onOpen();
  };

  const handleDeleteOwners = async (ids) => {
    try {
      setIsLoding(true);
      setError("");
      const deleteIds = Array.isArray(ids) ? ids : selectedValues;
      const response = await deleteManyApi("api/owner/deleteMany", deleteIds);
      if (response?.status === 200) {
        setSelectedValues([]);
        setDeleteModel(false);
        setAction((pre) => !pre);
      } else {
        setError(
          response?.response?.data?.message ||
            response?.response?.data?.error ||
            "Failed to delete owner."
        );
      }
    } catch (e) {
      setError(e?.message || "Failed to delete owner.");
    } finally {
      setIsLoding(false);
    }
  };

  const actionHeader = {
    Header: "Action",
    accessor: "action",
    isSortable: false,
    center: true,
    cell: ({ row }) => (
      <Text fontSize="md" fontWeight="900" textAlign="center">
        <Menu isLazy>
          <MenuButton>
            <CiMenuKebab />
          </MenuButton>
          <MenuList minW="fit-content">
            <MenuItem
              py={2.5}
              icon={<EditIcon fontSize={15} mb={1} />}
              onClick={() => openEdit(row?.original?._id)}
            >
              Edit
            </MenuItem>
            <MenuItem
              py={2.5}
              color="green"
              icon={<ViewIcon mb={1} fontSize={15} />}
              onClick={() => openEdit(row?.original?._id)}
            >
              View
            </MenuItem>
            <MenuItem
              py={2.5}
              color="red"
              icon={<DeleteIcon fontSize={15} mb={1} />}
              onClick={() => {
                setSelectedValues([row?.original?._id]);
                setDeleteModel(true);
              }}
            >
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </Text>
    ),
  };

  const tableColumns = [
    { Header: "#", accessor: "_id", isSortable: false, width: 10 },
    { Header: "Name", accessor: "name" },
    { Header: "Phone", accessor: "phone" },
    { Header: "WhatsApp", accessor: "whatsapp" },
    { Header: "Email", accessor: "email" },
    {
      Header: "Preferred Payout Method",
      accessor: "payoutMethod",
      cell: (cell) => formatLabel(cell?.value),
    },
    {
      Header: "Commission Type",
      accessor: "commissionType",
      cell: (cell) => formatLabel(cell?.value),
    },
    { Header: "Commission Value", accessor: "commissionValue" },
    actionHeader,
  ];

  useEffect(() => {
    fetchOwners();
  }, [action]);

  return (
    <>
      {error && (
        <Alert status="error" mb={4} borderRadius="8px">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <CommonCheckTable
        title="Owners"
        isLoding={isLoding}
        columnData={tableColumns}
        allData={owners || []}
        tableData={owners || []}
        tableCustomFields={[]}
        action={action}
        setAction={setAction}
        AdvanceSearch={false}
        access={access}
        onOpen={openAdd}
        setDelete={setDeleteModel}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
        selectType="single"
      />
      <OwnerForm
        isOpen={isOpen}
        onClose={onClose}
        selectedId={selectedId}
        mode={formMode}
        onSaved={() => setAction((pre) => !pre)}
      />
      <CommonDeleteModel
        isOpen={deleteModel}
        onClose={() => setDeleteModel(false)}
        type="Owner"
        handleDeleteData={handleDeleteOwners}
        ids={selectedValues}
        selectedValues={selectedValues}
      />
    </>
  );
};

export default Owners;
