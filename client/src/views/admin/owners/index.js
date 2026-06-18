import { DeleteIcon, EditIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import CommonDeleteModel from "components/commonDeleteModel";
import CommonCheckTable from "components/reactTable/checktable";
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FiCreditCard, FiPlus, FiUserCheck, FiUsers } from "react-icons/fi";
import { MdOutlineContactPhone, MdPercent } from "react-icons/md";
import { toast } from "react-toastify";
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
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const subtleText = useColorModeValue("secondaryGray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
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
        const message =
          response?.response?.data?.message ||
            response?.response?.data?.error ||
            "Failed to load owners.";
        setError(message);
        toast.error(message);
      }
    } catch (e) {
      const message = e?.message || "Failed to load owners.";
      setError(message);
      toast.error(message);
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
        toast.success("Owner deleted successfully.");
        setAction((pre) => !pre);
      } else {
        const message =
          response?.response?.data?.message ||
            response?.response?.data?.error ||
            "Failed to delete owner.";
        setError(message);
        toast.error(message);
      }
    } catch (e) {
      const message = e?.message || "Failed to delete owner.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoding(false);
    }
  };

  const ownersWithBankDetails = owners?.filter(
    (owner) =>
      owner?.bankName || owner?.bankAccountName || owner?.bankAccountNumber
  )?.length;

  const commissionBasedOwners = owners?.filter(
    (owner) => owner?.commissionType && owner?.commissionType !== "none"
  )?.length;

  const missingContactInfo = owners?.filter(
    (owner) => !owner?.phone && !owner?.whatsapp && !owner?.email
  )?.length;

  const kpiCards = [
    {
      label: "Total Owners",
      value: owners?.length || 0,
      icon: FiUsers,
      color: "brand.500",
    },
    {
      label: "Owners With Bank Details",
      value: ownersWithBankDetails,
      icon: FiCreditCard,
      color: "green.500",
    },
    {
      label: "Commission-Based Owners",
      value: commissionBasedOwners,
      icon: MdPercent,
      color: "orange.500",
    },
    {
      label: "Missing Contact Info",
      value: missingContactInfo,
      icon: MdOutlineContactPhone,
      color: missingContactInfo > 0 ? "red.500" : "green.500",
    },
  ];

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
    {
      Header: "Owner",
      accessor: "name",
      cell: (cell) => (
        <Box>
          <Text color="secondaryGray.900" fontWeight="700">
            {cell?.value || "-"}
          </Text>
          <Text color="secondaryGray.600" fontSize="xs" fontWeight="500">
            {cell?.row?.original?.email || "No email saved"}
          </Text>
        </Box>
      ),
    },
    {
      Header: "Contact",
      accessor: "phone",
      cell: (cell) => (
        <Box>
          <Text>{cell?.row?.original?.phone || "-"}</Text>
          <Text color="secondaryGray.600" fontSize="xs" fontWeight="500">
            WhatsApp: {cell?.row?.original?.whatsapp || "-"}
          </Text>
        </Box>
      ),
    },
    {
      Header: "Preferred Payout Method",
      accessor: "payoutMethod",
      cell: (cell) => (
        <Badge colorScheme="blue" variant="subtle">
          {formatLabel(cell?.value)}
        </Badge>
      ),
    },
    {
      Header: "Commission Type",
      accessor: "commissionType",
      cell: (cell) => {
        const value = cell?.value || "none";
        const color = value === "percentage" ? "green" : value === "fixed" ? "orange" : "gray";
        return (
          <Badge colorScheme={color} variant="subtle">
            {formatLabel(value)}
          </Badge>
        );
      },
    },
    {
      Header: "Commission Value",
      accessor: "commissionValue",
      cell: (cell) => {
        const type = cell?.row?.original?.commissionType;
        if (!cell?.value) return "-";
        return type === "percentage" ? `${cell?.value}%` : cell?.value;
      },
    },
    {
      Header: "Bank Details",
      accessor: "bankName",
      cell: (cell) => {
        const hasBank =
          cell?.row?.original?.bankName ||
          cell?.row?.original?.bankAccountName ||
          cell?.row?.original?.bankAccountNumber;
        return (
          <Badge colorScheme={hasBank ? "green" : "red"} variant="subtle">
            {hasBank ? "Complete" : "Missing"}
          </Badge>
        );
      },
    },
    actionHeader,
  ];

  useEffect(() => {
    fetchOwners();
  }, [action]);

  const handleOwnerSaved = (mode) => {
    toast.success(mode === "edit" ? "Owner updated successfully." : "Owner created successfully.");
    setAction((pre) => !pre);
  };

  return (
    <Box bg={pageBg} minH="100%" p={{ base: 3, md: 0 }}>
      {error && (
        <Alert status="error" mb={4} borderRadius="8px">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <Flex
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="12px"
        mb={4}
        p={{ base: 4, md: 6 }}
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        gap={4}
      >
        <Box>
          <HStack spacing={2} mb={2}>
            <Flex
              align="center"
              justify="center"
              bg="brand.50"
              color="brand.500"
              borderRadius="10px"
              h="36px"
              w="36px"
            >
              <FiUserCheck />
            </Flex>
            <Heading size="md" color="secondaryGray.900">
              Owners
            </Heading>
          </HStack>
          <Text color={subtleText} fontSize="sm" maxW="620px">
            Manage property owners, payout details, and commission rules.
          </Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          variant="brand"
          size="sm"
          alignSelf={{ base: "stretch", md: "center" }}
          onClick={openAdd}
        >
          Add Owner
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} mb={4}>
        {kpiCards?.map((card) => {
          const CardIcon = card?.icon;
          return (
            <Box
              key={card?.label}
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="12px"
              p={4}
            >
              <Flex align="center" justify="space-between" gap={3}>
                <Box>
                  <Text color={subtleText} fontSize="xs" fontWeight="700" mb={2}>
                    {card?.label}
                  </Text>
                  <Text color="secondaryGray.900" fontSize="2xl" fontWeight="800">
                    {card?.value}
                  </Text>
                </Box>
                <Flex
                  align="center"
                  justify="center"
                  borderRadius="10px"
                  bg="gray.100"
                  color={card?.color}
                  h="42px"
                  w="42px"
                  flexShrink={0}
                >
                  <CardIcon size={20} />
                </Flex>
              </Flex>
            </Box>
          );
        })}
      </SimpleGrid>

      {!isLoding && owners?.length === 0 && (
        <Box
          bg={cardBg}
          border="1px dashed"
          borderColor={borderColor}
          borderRadius="12px"
          p={5}
          mb={4}
        >
          <Grid templateColumns="repeat(12, 1fr)" gap={4} alignItems="center">
            <GridItem colSpan={{ base: 12, md: 8 }}>
              <Text color="secondaryGray.900" fontWeight="800" mb={1}>
                No owners added yet
              </Text>
              <Text color={subtleText} fontSize="sm">
                Add your first owner to start tracking payout details and commission rules.
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 4 }} textAlign={{ base: "left", md: "right" }}>
              <Button leftIcon={<FiPlus />} variant="brand" size="sm" onClick={openAdd}>
                Add Owner
              </Button>
            </GridItem>
          </Grid>
        </Box>
      )}

      <CommonCheckTable
        title="Owner Directory"
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
        addBtn={false}
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
        onSaved={handleOwnerSaved}
      />
      <CommonDeleteModel
        isOpen={deleteModel}
        onClose={() => setDeleteModel(false)}
        type="Owner"
        handleDeleteData={handleDeleteOwners}
        ids={selectedValues}
        selectedValues={selectedValues}
      />
    </Box>
  );
};

export default Owners;
