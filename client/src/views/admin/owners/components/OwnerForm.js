import { CloseIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select,
  Text,
  Textarea,
} from "@chakra-ui/react";
import Spinner from "components/spinner/Spinner";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { getApi, postApi, putApi } from "services/api";
import * as yup from "yup";

const initialOwnerValues = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  nationalId: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  payoutMethod: "bank_transfer",
  commissionType: "percentage",
  commissionValue: 0,
  payoutSchedule: "",
  notes: "",
};

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Enter a valid email"),
  commissionValue: yup
    .number()
    .typeError("Commission value must be a number")
    .min(0, "Commission value cannot be negative"),
});

const OwnerForm = (props) => {
  const { isOpen, onClose, selectedId, mode, onSaved } = props;
  const [isLoding, setIsLoding] = useState(false);
  const [error, setError] = useState("");
  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  const formik = useFormik({
    initialValues: initialOwnerValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: () => {
      saveOwner();
    },
  });

  const {
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
  } = formik;

  const closeForm = () => {
    setError("");
    resetForm();
    onClose();
  };

  const fetchOwner = useCallback(async () => {
    if (!selectedId || !isOpen || mode !== "edit") return;

    try {
      setIsLoding(true);
      setError("");
      const response = await getApi("api/owner/view/", selectedId);
      if (response?.status === 200) {
        setValues({
          ...initialOwnerValues,
          ...response?.data,
          commissionValue: response?.data?.commissionValue || 0,
        });
      } else {
        setError(response?.response?.data?.message || "Failed to load owner.");
      }
    } catch (e) {
      setError(e?.message || "Failed to load owner.");
    } finally {
      setIsLoding(false);
    }
  }, [isOpen, mode, selectedId, setValues]);

  const saveOwner = async () => {
    try {
      setIsLoding(true);
      setError("");

      const payload = {
        ...values,
        commissionValue: Number(values?.commissionValue || 0),
      };

      const response =
        mode === "edit"
          ? await putApi(`api/owner/edit/${selectedId}`, payload)
          : await postApi("api/owner/add", { ...payload, createBy: userId });

      if (response?.status === 200) {
        onSaved();
        closeForm();
      } else {
        setError(
          response?.response?.data?.message ||
            response?.response?.data?.error ||
            "Failed to save owner."
        );
      }
    } catch (e) {
      setError(e?.message || "Failed to save owner.");
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(() => {
    fetchOwner();
  }, [fetchOwner]);

  useEffect(() => {
    if (isOpen && mode === "add") {
      resetForm();
      setError("");
    }
  }, [isOpen, mode, resetForm]);

  return (
    <Drawer isOpen={isOpen} size="xl" onClose={closeForm}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader
          alignItems="center"
          justifyContent="space-between"
          display="flex"
        >
          {mode === "edit" ? "Edit Owner" : "Add Owner"}
          <IconButton onClick={closeForm} icon={<CloseIcon />} />
        </DrawerHeader>
        <DrawerBody>
          {error && (
            <Alert status="error" mb={4} borderRadius="8px">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {isLoding && mode === "edit" ? (
            <Spinner />
          ) : (
            <Grid templateColumns="repeat(12, 1fr)" gap={3}>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel display="flex" fontSize="sm" fontWeight="500">
                  Name<Text color="red">*</Text>
                </FormLabel>
                <Input
                  name="name"
                  value={values?.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Owner name"
                  borderColor={errors?.name && touched?.name ? "red.300" : null}
                />
                <Text color="red" minH="20px">
                  {errors?.name && touched?.name && errors?.name}
                </Text>
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Phone
                </FormLabel>
                <Input
                  name="phone"
                  value={values?.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Phone"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  WhatsApp
                </FormLabel>
                <Input
                  name="whatsapp"
                  value={values?.whatsapp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="WhatsApp"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Email
                </FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={values?.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email"
                  borderColor={
                    errors?.email && touched?.email ? "red.300" : null
                  }
                />
                <Text color="red" minH="20px">
                  {errors?.email && touched?.email && errors?.email}
                </Text>
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  National ID
                </FormLabel>
                <Input
                  name="nationalId"
                  value={values?.nationalId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="National ID"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Preferred Payout Method
                </FormLabel>
                <Select
                  name="payoutMethod"
                  value={values?.payoutMethod}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="wallet">Wallet</option>
                  <option value="other">Other</option>
                </Select>
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 4 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Bank Name
                </FormLabel>
                <Input
                  name="bankName"
                  value={values?.bankName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Bank name"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 4 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Bank Account Name
                </FormLabel>
                <Input
                  name="bankAccountName"
                  value={values?.bankAccountName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Account name"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 4 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Bank Account Number
                </FormLabel>
                <Input
                  name="bankAccountNumber"
                  value={values?.bankAccountNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Account number"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 4 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Commission Type
                </FormLabel>
                <Select
                  name="commissionType"
                  value={values?.commissionType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                  <option value="none">None</option>
                </Select>
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 4 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Commission Value
                </FormLabel>
                <Input
                  name="commissionValue"
                  type="number"
                  value={values?.commissionValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0"
                  borderColor={
                    errors?.commissionValue && touched?.commissionValue
                      ? "red.300"
                      : null
                  }
                />
                <Text color="red" minH="20px">
                  {errors?.commissionValue &&
                    touched?.commissionValue &&
                    errors?.commissionValue}
                </Text>
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 4 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Payout Schedule
                </FormLabel>
                <Input
                  name="payoutSchedule"
                  value={values?.payoutSchedule}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Monthly, after checkout, custom"
                />
              </GridItem>

              <GridItem colSpan={{ base: 12 }}>
                <FormLabel fontSize="sm" fontWeight="500">
                  Notes
                </FormLabel>
                <Textarea
                  name="notes"
                  value={values?.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Internal notes"
                />
              </GridItem>
            </Grid>
          )}
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={closeForm}>
            Cancel
          </Button>
          <Button
            variant="brand"
            onClick={handleSubmit}
            isDisabled={isLoding}
          >
            {isLoding ? <Spinner /> : "Save"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default OwnerForm;
